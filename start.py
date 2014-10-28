#!/usr/bin/env python
# -*- coding:utf-8 -*-

# ---------Edit By KaiHangYang----------
# -------------2014,10,27---------------
# 这个是使用tornado来写的博客，第一次尝试，我会尽力的～
import os.path
import torndb
import md5
from tornado import web
from tornado import gen
from tornado import escape
from tornado import httpserver
from tornado import ioloop
from tornado.options import options, define, parse_command_line

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
        self.render('index.html', title='My Blog', user=self.current_user)


class LoginHandler(BaseHandler):
    def get(self):
        self.render('login.html', title='Login')

    def post(self):
        self.check_xsrf_cookie()
        try:
            m = md5.new()
            account = self.get_body_argument('account')
            m.update(self.get_body_argument('password'))
            password = m.hexdigest()

            user = self.db.get('SELECT * FROM user '
                'WHERE account=%s AND password=%s LIMIT 1',
                account, password)
            if user:
                self.set_secure_cookie('user_name', user.account)
                self.redirect('/')
        except:
            self.write('log failed!')


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user_name")
        self.redirect('/')


class RegisterHandler(BaseHandler):
    def get(self):
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
