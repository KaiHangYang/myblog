#!/usr/bin/env python
# -*- coding:utf-8 -*-

# ---------Edit By KaiHangYang----------
# -------------2014,10,27---------------
# 这个是使用tornado来写的博客，第一次尝试，我会尽力的～
import os.path
import torndb
import md5
import time
from tornado import web
from tornado import gen
from tornado import escape
from tornado import httpserver
from tornado import ioloop
from tornado.options import options, define, parse_command_line
from concurrent import futures
from tornado import concurrent

define('debug', default=1, type=int, help='Open debug mode or '
       'not(default:enabled), 0 to disable it, 1 to enable it.')
define('port', default=8888, type=int, help='Set the port '
       'this application listen')
define('db_user', default='myblog', type=str)
define('db_pw', default='y1995kh221', type=str)
define('db_host', default='localhost', type=str)
define('db_name', default='blog', type=str)


class MainApplication(web.Application):
    def __init__(self):
        route = [
            [r'/', MainHandler],
            [r'/login', LoginHandler],
            [r'/logout', LogoutHandler],
            [r'register', RegisterHandler],
            [r'/admin', AdminHandler],
        ]
        settings = dict(
            debug=True,
            xsrf_cookies=True,
            cookie_secret='My_NAME_IS_KAIHANGYANG_PW_Y1995KH221',
            login_url=r'/login',
            template_path=os.path.join(os.path.dirname(__file__), 'template'),
            static_path=os.path.join(os.path.dirname(__file__), 'static'),
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
    @web.authenticated
    def get(self):
        self.render('index.html', title='My Blog', user_logo='wolf.png')


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
                print 'text'
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
