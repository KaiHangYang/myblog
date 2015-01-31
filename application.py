#!/usr/bin/env python
# -*- coding:utf-8 -*-

# ---------Edit By KaiHangYang----------
# -------------2014,10,27---------------
# 这个是使用tornado来写的博客，第一次尝试，我会尽力的～
import os
import torndb
import md5
import time
import markdown
from concurrent import futures
from tornado import (
    web,
    gen,
    escape,
    concurrent,
    template,
)


class MainApplication(web.Application):
    def __init__(self, settings, db_info, article_path, template_path,
                 shot_path, dev):
        route = [
            [r'/', MainHandler],
            [r'/admin', AdminHandler],
            [r'/login', LoginHandler],
            [r'/logout', LogoutHandler],
            [r'register', RegisterHandler],
            [r'/addarticle', AddArticleHandler],
            [r'/edit([0-9\.]*)', EditArticleHandler],
            [r'/article/([0-9\.]*)', ShowArticleHandler],
            [r'/manage', ArticleManageHandler],
            [r'/pageshot', PageShotHandler]
        ]

        web.Application.__init__(self, route, **settings)


# 添加一个全局的数据库
        self.db = torndb.Connection(
             host=db_info['db_host'], database=db_info['db_name'],
             user=db_info['db_user'], password=db_info['db_pw'],
        )

        self.article_path = article_path
        self.shot_path = shot_path
        self.template_path = template_path

        self.static_path = settings['static_path']
        self.dev = dev


class BaseHandler(web.RequestHandler):
    executor = futures.ThreadPoolExecutor(4)

    @property
    def db(self):
        return self.application.db

    @property
    def article_path(self):
        return self.application.article_path

    @property
    def static_path(self):
        return self.application.static_path

    @property
    def dev(self):
        return self.application.dev

    @property
    def shot_path(self):
        return self.application.shot_path

    @property
    def template_path(self):
        return self.application.template_path

    def get_current_user(self):
        user = self.get_secure_cookie('user_name')
        if not user: return None
        return user


class ArticleHandler(BaseHandler):
    def make_article_id(self, user, timestamp):
        aid = md5.new()
        aid.update(user+timestamp)
        aid = aid.hexdigest()

        return aid

    def get_article_id(self, user, timestamp):
        result = self.db.get('select article_id from user_article where '
                             'account=%s and timestamp=%s', user, timestamp)

        if result:
            return result['article_id']
        else:
            return None

    def check_article(self, user_dir, filename, article):
        if not os.path.exists(user_dir) or not os.path.isdir(user_dir):
            os.mkdir(user_dir)

        if not os.path.exists(filename):
            with open(filename, 'w') as f:
                f.write('{% extends "'+os.path.join(os.path.dirname(__file__),
                        'template/showarticle.html')+'" %}'
                        '{% block art_content %}'+markdown.markdown(article)+
                        '{% end %}')

    @concurrent.run_on_executor
    def add_article(self, user, timestamp, title, brief_intro, article):
        try:
            article_id = self.make_article_id(user, timestamp)
            fname = os.path.join(self.article_path, user, article_id)
            if (not os.path.exists(self.article_path+'/'+user) or
                not os.path.isdir(self.article_path+'/'+user)):
                os.mkdir(self.article_path+'/'+user)
            if self.db.get('select article_id from user_article '
                           'where article_id=%s', article_id):
                self.db.execute('update user_article '
                                'set article=%s,title=%s,brief_intro=%s where'
                                ' article_id=%s',
                                article, title, brief_intro, article_id)
                with open(fname, 'w') as f:
                    f.write('{% extends "' +
                            os.path.join(os.path.dirname(__file__),
                                         'template/showarticle.html') +
                                         '" %}{% block art_content %}' +
                                         markdown.markdown(article) +
                                         '{% end %}')

                picpath = os.path.join(self.shot_path, user, article_id)

                if os.path.exists(picpath):
                    os.remove(picpath)

            else:
                self.db.execute('INSERT INTO user_article '
                                'VALUES(%s,%s,%s,%s,%s, %s)', user, article,
                                timestamp, title, brief_intro, article_id)

                with open(fname, 'w') as f:
                    f.write('{% extends "' +
                            os.path.join(os.path.dirname(__file__),
                            'template/showarticle.html')+'" %}'
                            '{% block art_content %}' +
                            markdown.markdown(article) +
                            '{% end %}')
        except StandardError, e:
            print e
            return False
        else:
            return True

    @concurrent.run_on_executor
    def delete_article(self, user, timestamp):
        article_id = self.make_article_id(user, timestamp)

        try:
            if self.db.get('select article_id from user_article where '
                           'article_id=%s', article_id):
                self.db.execute('delete from user_article where account=%s '
                                'and article_id=%s',
                                user, article_id)

                fname = os.path.join(self.article_path, user, article_id)
                picpath = os.path.join(self.shot_path, user, article_id)

                if os.path.exists(fname):
                    os.remove(fname)
                if os.path.exists(picpath):
                    os.remove(picpath)

        except StandardError, e:
            print e
            return False
        else:
            return True

    @concurrent.run_on_executor
    def edit_article(self, user, timestamp):
        try:
            result = self.get_article_id(user, timestamp)
            if result:
                return result
            else:
                return False
        except StandardError, e:
            print e
            return False

    @concurrent.run_on_executor
    def get_article(self, user, timestamp):

        article_id = self.get_article_id(user, timestamp)

        if not article_id: return {'success': False}
        try:
            result = self.db.get('select title,brief_intro,article from '
                                'user_article where article_id=%s', article_id)
            if result:
                return {'success': True, 'content': result}
            else:
                return {'success': False}
        except StandardError, e:
            print e
            return {'success': False}


class MainHandler(BaseHandler):

    def get(self):
        # 这个只是临时这样的
        self.current_owner = self.db.get('select account from '
                                   'user where admin=1')['account']

        if not self.current_owner:
            self.write('/博主很懒还没开始写呢～')
        else:
            self.set_secure_cookie('owner_name', self.current_owner)
            if not self.current_user:
                self.render('index.html', title='A running wolf\'s blog',
                            admin=0, user_logo='wolf.png', dev=self.dev)
            else:
                self.redirect('/admin')

    @gen.coroutine
    def post(self):
        if self.request.body == 'show':
            articles = yield self.get_articles()
            self.write(articles)

    @concurrent.run_on_executor
    def get_articles(self):

        owner_name = self.get_secure_cookie('owner_name')
        articles = self.db.query('select article_id,title,brief_intro,timestamp'
                                 ' from user_article where account=%s',
                                 owner_name)

        articles = self.article_check(articles, owner_name)
        articles = dict(zip(range(len(articles)), articles))
        articles['length'] = len(articles)
        return articles

    def article_check(self, article, owner_name):
        articles = []
        for i in article:
            article_name = i['article_id']
            fname = os.path.join(self.article_path, owner_name, article_name)
            if os.path.exists(fname):
                articles.append(i)
            else:
                content = self.db.query('select article from user_article '
                                        'where article_id=%s', i['article_id'])
                with open(fname, 'w') as f:
                    content = markdown.markdown(content)
                    f.write('{% extends "'+os.path.join(os.path.dirname(__file__),
                            'template/showarticle.html')+
                            '" %}{% block art_content %}' + content
                            +'{% end %}')

                articles.append(i)

        return articles


class AdminHandler(MainHandler):

    @web.authenticated
    def get(self):
        self.render('index.html', title='My Blog', user_logo='wolf.png',
                    admin=1, dev=self.dev)

    @web.authenticated
    @gen.coroutine
    def post(self):
        if self.request.body == 'show':
            articles = yield self.get_articles()
            self.write(articles)


class LoginHandler(BaseHandler):
    def get(self):
        if self.get_secure_cookie('user_name'):
            self.redirect('/admin')
        else:
            self.render('login.html', title='Login', dev=self.dev)

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
        self.render('register.html', title='Header', dev=self.dev)

    def post(self):
        pass


class AddArticleHandler(ArticleHandler):
    @web.authenticated
    def get(self):
        self.set_secure_cookie('timestamp', str(time.time()))
        self.render('addArticle.html', user=self.current_user,
                    title='Add article', user_logo='wolf.png', admin=1,
                    dev=self.dev)

    @web.authenticated
    @gen.coroutine
    def post(self):
        self.check_xsrf_cookie()
        timestamp = self.get_secure_cookie('timestamp')

        if self.request.headers['Content-Type'].startswith('application/json'):
            requestbody = escape.json_decode(self.request.body)
            result = yield self.add_article(self.current_user, timestamp,
                                            requestbody['title'],
                                            requestbody['brief_intro'],
                                            requestbody['article'])

        elif self.request.body == 'delete':
            result = yield self.delete_article(self.current_user, timestamp)
        else:
            result = False

        self.write(dict(result=result))
        self.finish()


class EditArticleHandler(ArticleHandler):
    @web.authenticated
    def get(self, timestamp):
        article_id = self.get_article_id(self.current_user, timestamp)
        if article_id:
            self.set_secure_cookie('timestamp', timestamp)
            self.render('addArticle.html', user=self.current_user,
                        title='Edit Article', user_logo='wolf.png', admin=1,
                        dev=self.dev)
        else:
            self.set_status(404)
            self.write('404 not found!')

    @web.authenticated
    @gen.coroutine
    def post(self, useless):
        self.check_xsrf_cookie()
        account = self.current_user
        timestamp = self.get_secure_cookie('timestamp')
        result = yield self.get_article(account, timestamp)
        self.write(result)


class ShowArticleHandler(ArticleHandler):
    def get(self, timestamp):
        query = 'select account from user where account=%s'

        if not self.current_user or not self.db.get(query, self.current_user):
            current_user = self.db.get('select * from user where admin=1'
                                       ' limit 1')['account']
            admin = 0
        else:
            current_user = self.current_user
            admin = 1

        article_id = self.make_article_id(current_user, timestamp)
        article = self.db.get('select * from user_article '
                       'where article_id=%s', article_id)

        if article:
            loader = template.Loader(self.template_path)

            user_dir = os.path.join(self.article_path, article['account'])
            filename = os.path.join(user_dir, article['article_id'])

            self.check_article(user_dir, filename, article['article'])

            self.write(loader.load(filename).generate(title=article['title']
                , static_url=self.static_url,
                user_logo='wolf.png', admin=admin, dev=self.dev))
        else:
            self.set_status(404)
            self.write('404 not found')

    def static_url(self, str):
        if str.startswith('/'):
            return '../'+'static'+str
        else:
            return '../'+'static/'+str


class ArticleManageHandler(ArticleHandler):

    @web.authenticated
    @gen.coroutine
    def post(self):
        self.check_xsrf_cookie()
        req = escape.json_decode(self.request.body)
        if req['act'] == 'del':
            result = yield self.delete_article(self.current_user,
                                               req['timestamp'])
            if result:
                self.write({'success': True, 'act': req['act']})
            else:
                self.write({'success': False, 'act': req['act']})
        elif req['act'] == 'edit':
            result = yield self.edit_article(self.current_user,
                                             req['timestamp'])
            if result:
                self.write({'success': True, 'act': req['act'],
                            'content': {'timestamp': req['timestamp']}})
            else:
                self.write({'success': False, 'act': req['act']})
        else:
            self.write({'success': False, 'act': req['act']})


class PageShotHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(1)

    @gen.coroutine
    def get(self):
        user = self.get_secure_cookie('owner_name')
        timestamp = self.get_argument('timestamp')

        picname = md5.new()
        picname.update(user+timestamp)
        picname = picname.hexdigest()

        userdir = os.path.join(self.shot_path, user)
        picpath = os.path.join(userdir, picname)

        result = yield self.get_shot(user, userdir, picpath, timestamp)

        if result['result']:
            self.set_header('Content-Type', 'image/jpeg')
            self.write(result['pic'])
        else:
            self.set_status(404, '没有这张图片啦 ╮(╯▽╰)╭')
            self.write('404 没有这张图片啦 ╮(╯▽╰)╭')

    @concurrent.run_on_executor
    def get_shot(self, user, userdir, picpath, timestamp):

        if not os.path.exists(userdir):
            os.mkdir(userdir)

        dbexist = self.db.get('select title from user_article where account=%s '
                           'and timestamp=%s', user, timestamp)

        if not os.path.exists(picpath) and dbexist:
            os.system('xvfb-run --server-args="-screen 0, 1024x768x24" '
                      'cutycapt --url=http://localhost:8000/article/' +
                      timestamp+' --out='+picpath+'.jpg;mv '+picpath+'.jpg ' +
                      picpath +
                      ';convert -crop 845x600+0+150 '+picpath+' '+picpath +
                      ';convert -resize 480x256 '+picpath+' '+picpath)

            result = True

        elif not dbexist:
            if os.path.exists(picpath):
                os.remove(picpath)
            result = False
        else:
            result = True

        if result:
            with open(picpath, 'rb') as f:
                pic = f.read()
        else:
            pic = None

        return dict(result=result, pic=pic)


'''class RemarkHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @gen.coroutine
    def post(self):
        req = escape.json_decode(self.request.body)

        if req['method'] == 'get':
'''
