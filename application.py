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
    def __init__(self, settings, db_info, article_path, shot_path, dev):
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

        self.static_path = settings['static_path']
        self.dev = dev

class BaseHandler(web.RequestHandler):
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

    def get_current_user(self):
        user = self.get_secure_cookie('user_name')
        if not user: return None
        return user


class MainHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

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
        articles = self.db.query('select title,brief_intro,timestamp'
                                 ' from user_article where account=%s',
                                 self.get_secure_cookie('owner_name'))

        articles = self.article_check(articles)
        articles = dict(zip(range(len(articles)), articles))
        articles['length'] = len(articles)
        return articles

    def article_check(self, article):
        articles = []
        owner_name = self.get_secure_cookie('owner_name')
        for i in article:
            article_name = owner_name+i['timestamp']+'.html'
            fname = os.path.join(self.article_path, article_name)
            if os.path.exists(fname):
                articles.append(i)
            else:
                content = self.db.query('select article from user_article '
                                        'where account=%s and title=%s and '
                                        'timestamp=%s', owner_name, i['title'],
                                        i['timestamp'])[0]['article']
                f = open(fname, 'w')
                content = markdown.markdown(content)
                f.write('{% extends "'+os.path.join(os.path.dirname(__file__),
                        'template/showarticle.html')+
                        '" %}{% block art_content %}' + content
                        +'{% end %}')
                f.close()
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
    executor = futures.ThreadPoolExecutor(4)

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


class AddArticleHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

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
            fname = self.article_path+'/'+user+timestamp+'.html'
            if self.db.get('select * from user_article '
            'where account=%s and timestamp=%s',
            user, timestamp):
                self.db.execute('update user_article '
                'set article=%s,title=%s,brief_intro=%s where'
                ' account=%s and timestamp=%s'
                , article, title, brief_intro, user, timestamp)
                f = open(fname, 'w')
                f.write('{% extends "'+os.path.join(os.path.dirname(__file__),
                                                  'template/showarticle.html')+
                        '" %}{% block art_content %}'+markdown.markdown(article)+
                        '{% end %}')
                f.close()
                picname = md5.new()
                picname.update(timestamp)
                picname = picname.hexdigest()
                picpath = os.path.join(self.shot_path, user, picname)

                if os.path.exists(picpath):
                    os.remove(picpath)

            else:
                self.db.execute('INSERT INTO user_article '
                                'VALUES(%s,%s,%s,%s,%s)', user, article,
                                timestamp, title, brief_intro)
                f = open(fname, 'w')
                f.write('{% extends "'+os.path.join(os.path.dirname(__file__),
                        'template/showarticle.html')+'" %}'
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
                fname = self.article_path+'/'+user+timestamp+'.html'
                picname = md5.new()
                picname.update(timestamp)
                picname = picname.hexdigest()
                picpath = os.path.join(self.shot_path, user, picname)
                if os.path.exists(fname):
                    os.remove(fname)
                if os.path.exists(picpath):
                    os.remove(picpath)
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
                        title='Edit Article', user_logo='wolf.png', admin=1,
                        dev=self.dev)
        else:
            self.set_status(404)
            self.write('404 not found')

    @web.authenticated
    @gen.coroutine
    def post(self, useless):
        self.check_xsrf_cookie()
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
    def get(self, timestamp):
        query = 'select account from user where account=%s'
        if not self.current_user or not self.db.get(query, self.current_user):
            current_user = self.db.get('select * from user where admin=1'
                                       ' limit 1')['account']
            admin = 0
        else:
            current_user = self.current_user
            admin = 1

        article = self.db.get('select * from user_article '
                       'where account=%s and timestamp=%s', current_user,
                       timestamp)
        if article:
            loader = template.Loader('')
            filename = os.path.join(self.article_path, article['account']+
                                    article['timestamp']+'.html')
            if not os.path.exists(filename):
                with open(filename, 'w') as f:
                    f.write('{% extends "'+os.path.join(os.path.dirname(__file__),
                            'template/showarticle.html')+'" %}'
                            '{% block art_content %}'+markdown.markdown(article)+
                            '{% end %}')
            self.write(loader.load(os.path.join(self.article_path,
                current_user+timestamp+'.html')).generate(title=article['title']
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


class ArticleManageHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @web.authenticated
    @gen.coroutine
    def post(self):
        self.check_xsrf_cookie()
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
            picname = md5.new()
            picname.update(timestamp)
            picname = picname.hexdigest()
            picpath = os.path.join(self.shot_path, user, picname)

            fname = os.path.join(self.article_path, user+timestamp+'.html')

            if os.path.exists(fname):
                os.remove(fname)

            if os.path.exists(picpath):
                os.remove(picpath)

        except:
            return False
        else:
            return True

    @concurrent.run_on_executor
    def art_edit(self, user, timestamp):
        try:
            result = self.db.get('select timestamp from user_article where '
                                 'account=%s and timestamp=%s', user,
                                 timestamp)
            if result:
                return result
            else:
                return False
        except:
            return False


class PageShotHandler(BaseHandler):
    executor = futures.ThreadPoolExecutor(4)

    @gen.coroutine
    def get(self):
        user = self.get_secure_cookie('owner_name')
        timestamp = self.get_argument('timestamp')

        picname = md5.new()
        picname.update(timestamp)
        picname = picname.hexdigest()

        userdir = os.path.join(self.shot_path, user)
        picpath = os.path.join(userdir, picname)

        result = yield self.get_shot(user, userdir, picpath, timestamp)

        if result['result']:
            self.set_header('Content-Type', 'image/jpeg')
            self.write(result['pic'])
        else:
            self.set_status('404', '没有这张图片啦 ╮(╯▽╰)╭')

    @concurrent.run_on_executor
    def get_shot(self, user, userdir, picpath, timestamp):

        if not os.path.exists(userdir):
            os.mkdir(userdir)

        dbexist = self.get('select title from user_article where account=%s '
                           'and timestamp=%s', user, timestamp)

        if not os.path.exists(picpath) and dbexist:
            os.system('xvfb-run cutycapt --url=http://localhost/article/' +
                      timestamp+' --out='+picpath+'.jpg;mv '+picpath+'.jpg ' +
                      picpath +
                      ';convert -crop 640x480+160+120 '+picpath+' '+picpath +
                      ';convert -resize 480x360 '+picpath+' '+picpath)

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
