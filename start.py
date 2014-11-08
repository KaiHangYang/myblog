#!/usr/bin/env python
# -*- coding:utf-8 -*-

# ---------Edit By KaiHangYang----------
# -------------2014,10,27---------------
# 这个是使用tornado来写的博客，第一次尝试，我会尽力的～
import os
import sys
import torndb
import md5
import time
import markdown
from tornado import web
from tornado import gen
from tornado import escape
from tornado import httpserver
from tornado import ioloop
from tornado.options import options, define, parse_command_line
from concurrent import futures
from tornado import concurrent
from tornado import template

define('debug', default=1, type=int, help='Open debug mode or '
       'not(default:enabled), 0 to disable it, 1 to enable it.')
define('port', default=8888, type=int, help='Set the port '
       'this application listen')
define('db_user', default='myblog', type=str)
define('db_pw', default='y1995kh221', type=str)
define('db_host', default='localhost', type=str)
define('db_name', default='blog', type=str)
define('article_path', default=os.path.join(os.path.dirname(__file__),
      'static/user_data/user_article'))
define('static_path', default=os.path.join(os.path.dirname(__file__), 'static')
       )
define('template_path', default=os.path.join(os.path.dirname(__file__),
                                             'template'))
reload(sys)
sys.setdefaultencoding('utf-8')


class MainApplication(web.Application):
    def __init__(self):
        route = [
            [r'/', MainHandler],
            [r'/login', LoginHandler],
            [r'/logout', LogoutHandler],
            [r'register', RegisterHandler],
            [r'/admin', AdminHandler],
            [r'/addarticle', AddArticleHandler],
            [r'/edit([0-9\.]*)', EditArticleHandler],
            [r'/article/([0-9\.]*)', ShowArticleHandler],
            [r'/manage', ArticleManageHandler],
        ]
        settings = dict(
            debug=True,
            xsrf_cookies=True,
            cookie_secret='My_NAME_IS_KAIHANGYANG_PW_Y1995KH221',
            login_url=r'/login',
            template_path=options.template_path,
            static_path=options.static_path,
        )
        web.Application.__init__(self, route, **settings)


# 添加一个全局的数据库
        self.db = torndb.Connection(
             host=options.db_host, database=options.db_name,
             user=options.db_user, password=options.db_pw
        )


class BaseHandler(web.RequestHandler):
    @property
    def db(self):
        return self.application.db

    def get_current_user(self):
        user = self.get_secure_cookie('user_name')
        if not user: return None
        return user


class MainHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @web.authenticated
    def get(self):
        self.render('index.html', title='My Blog', user_logo='wolf.png')

    @web.authenticated
    @gen.coroutine
    def post(self):
        if self.request.body == 'show':
            articles = yield self.get_articles()
            self.write(articles)

    @concurrent.run_on_executor
    def get_articles(self):
        articles = self.db.query('select title,brief_intro,timestamp'
                                 ' from user_article where account=%s',
                                 self.get_secure_cookie('user_name'))
        articles = dict(zip(range(len(articles)), articles))
        articles['length'] = len(articles)
        return articles


class LoginHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    def get(self):
        if self.get_secure_cookie('user_name'):
            self.redirect('/')
        else:
            self.render('login.html', title='Login')

    @gen.coroutine
    def post(self):
        self.check_xsrf_cookie()
        account = self.get_body_argument('account')
        password = self.get_body_argument('password')
        if len(password) != 0:
            m = md5.new()
            m.update(password)
            password = m.hexdigest()

        user = yield self.check_user(account)
        self.add_header('Content-Type', 'application/json')
        if user:
            if user.password != password and len(password) != 0:
                self.write({'login': False, 'msg': '用户名不存在！'})
            elif len(password) == 0:
                self.write({'msg': '密码为空！', 'login': False})
            else:
                self.set_secure_cookie('user_name', user.account)
                self.write({'msg': '登陆成功！', 'login': True})
        else:
            self.write({'msg': '用户名不存在！', 'login': False})

    @concurrent.run_on_executor
    def check_user(self, account):
        time.sleep(3)
        user = self.db.get('SELECT * FROM user '
            'WHERE account=%s LIMIT 1', account)
        return user


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user_name")
        self.redirect('/')


class RegisterHandler(BaseHandler):
    def get(self):
        self.write('asd')
        self.render('register.html', title='Header')

    def post(self):
        pass


class AddArticleHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @web.authenticated
    def get(self):
        self.set_secure_cookie('timestamp', str(time.time()))
        self.render('addArticle.html', user=self.current_user,
                    title='Add article', user_logo='wolf.png')

    @web.authenticated
    @gen.coroutine
    def post(self):
        self.check_xsrf_cookie()
        if self.request.headers['Content-Type'].startswith('application/json'):
            requestbody = escape.json_decode(self.request.body)
            result = yield self.addArticle(self.current_user,
                                           requestbody['article'],
                                           requestbody['title'],
                                           requestbody['brief_intro'])
        elif self.request.body == 'delete':
            result = yield self.deleteArticle(self.current_user,
                     self.get_secure_cookie('timestamp'))
        else:
            result = False

        self.write(dict(result=result))
        self.finish()

    @concurrent.run_on_executor
    def addArticle(self, user, article, title, brief_intro):
        try:
            timestamp = self.get_secure_cookie('timestamp')
            fname = options.article_path+'/'+user+timestamp+'.html'
            if self.db.get('select * from user_article '
            'where account=%s and timestamp=%s',
            user, timestamp):
                self.db.execute('update user_article '
                'set article=%s,title=%s,brief_intro=%s where'
                ' account=%s and timestamp=%s'
                , article, title, brief_intro, user, timestamp)
                f = open(fname, 'w')
                f.write('{% extends "../../../template/showarticle.html" %}'
                        '{% block art_content %}'+markdown.markdown(article)+
                        '{% end %}')
                f.close()
            else:
                self.db.execute('INSERT INTO user_article '
                                'VALUES(%s,%s,%s,%s,%s)', user, article,
                                timestamp, title, brief_intro)
                f = open(fname, 'w')
                f.write('{% extends "../../../template/showarticle.html" %}'
                        '{% block art_content %}'+markdown.markdown(article)+
                        '{% end %}')
                f.close()
        except:
            return False
        else:
            return True

    @concurrent.run_on_executor
    def deleteArticle(self, user, timestamp):
        try:
            if self.db.get('select * from user_article where '
            'account=%s and timestamp=%s', user, timestamp):
                self.db.execute('delete from user_article where account=%s '
                'and timestamp=%s', user, timestamp)
                fname = options.article_path+'/'+user+timestamp+'.html'
                if os.path.exists(fname):
                    os.remove(fname)
        except:
            return False
        else:
            return True


class EditArticleHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @web.authenticated
    def get(self, timestamp):
        if self.db.get('select account from user_article '
                       'where account=%s and timestamp=%s', self.current_user,
                       timestamp):
            self.set_secure_cookie('timestamp', timestamp)
            self.render('addArticle.html', user=self.current_user,
                        title='Edit Article', user_logo='wolf.png')
        else:
            self.set_status(404)
            self.write('404 not found')

    @web.authenticated
    @gen.coroutine
    def post(self, useless):
        account = self.current_user
        timestamp = self.get_secure_cookie('timestamp')
        result = yield self.get_article(account, timestamp)
        self.write(result)

    @concurrent.run_on_executor
    def get_article(self, account, timestamp):
        try:
            result = self.db.get('select title,brief_intro,article from '
                                'user_article where account=%s and timestamp=%s',
                                account, timestamp)
            if result:
                return {'success': True, 'content': result}
            else:
                return {'success': False}
        except:
            return {'success': False}


class ShowArticleHandler(BaseHandler):
    def initialize(self):
        self.static_path = options.static_path

    def get(self, timestamp):
        if self.db.get('select account from user_article '
                       'where account=%s and timestamp=%s', self.current_user,
                       timestamp):
            loader = template.Loader('')
            self.write(loader.load(os.path.join(options.article_path,
                self.get_secure_cookie('user_name')+timestamp+
                '.html')).generate(title='test', static_url=self.static_url,
                                   user_logo='wolf.png'))
        else:
            self.set_status(404)
            self.write('404 not found')

    def static_url(self, str):
        if str.startswith('/'):
            return '/'+self.static_path+str
        else:
            return '/'+self.static_path+'/'+str


class ArticleManageHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @web.authenticated
    @gen.coroutine
    def post(self):
        req = escape.json_decode(self.request.body)
        if req['act'] == 'del':
            result = yield self.art_delete(self.current_user, req['timestamp'])
            if result:
                self.write({'success': True, 'act': req['act']})
            else:
                self.write({'success': False, 'act': req['act']})
        elif req['act'] == 'edit':
            result = yield self.art_edit(self.current_user, req['timestamp'])

            if result:
                self.write({'success': True, 'act': req['act'], 'content': result})
            else:
                self.write({'success': False, 'act': req['act']})
        else:
            self.write({'success': False, 'act': req['act']})

    @concurrent.run_on_executor
    def art_delete(self, user, timestamp):
        try:
            self.db.execute('delete from user_article where '
                            'account=%s and timestamp=%s', user, timestamp)
            fname = os.path.join(options.article_path, user+timestamp+'.html')
            if os.path.exists(fname):
                os.remove(fname)

        except:
            return False
        else:
            return True

    @concurrent.run_on_executor
    def art_edit(self, user, timestamp):
        try:
            result = self.db.get('select timestamp from user_article where '
                                 'account=%s and timestamp=%s', user, timestamp)
            if result:
                return result
            else:
                return False
        except:
            return False


class AdminHandler(BaseHandler):
    def get(self):
        self.render('admin.html', title='Admin')

    def post(self):
        pass


def main():
    parse_command_line()
    server = httpserver.HTTPServer(MainApplication())
    server.listen(options.port)
    ioloop.IOLoop.current().start()

if __name__ == '__main__':
    main()
