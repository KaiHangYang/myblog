#!/usr/bin/env python
# -*- coding:utf-8 -*-

# ---------Edit By KaiHangYang----------
# -------------2014,10,27---------------
# 这个是使用tornado来写的博客，第一次尝试，我会尽力的～
import os.path

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


class MainApplication(web.Application):
    def __init__(self):
        route = [
            [r'/', MainHandler],
            [r'/login', LoginHandler],
            [r'register', RegisterHandler],
            [r'/admin', AdminHandler],
        ]
        settings = dict(
            debug=True,
            xsrf_cookies=True,
            cookie_secret='My_NAME_IS_KAIHANGYANG_PW_Y1995KH221',
            login_url=r'/login',
            template_path=os.path.join(os.path.dirname(__file__), 'template'),
            static_path=os.path.join(os.path.dirname(__file__), 'static')
        )
        web.Application.__init__(self, route, **settings)


class BaseHandler(web.RequestHandler):
    def get_current_user(self):
        user_id = self.get_secure_cookie('user_id')
        if not user_id: return None
        return user_id


class MainHandler(BaseHandler):
    @web.authenticated
    def get(self):
        self.render('index.html', title='My Blog', user=self.current_user())


class LoginHandler(BaseHandler):
    def get(self):
        self.render('login.html', title='Login')

    def post(self):
        pass


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
