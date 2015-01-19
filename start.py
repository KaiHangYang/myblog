#!/usr/bin/env python
# -*- coding:utf-8 -*-

# ---------Edit By KaiHangYang----------
# -------------2015,01,15---------------
import os
import sys
from tornado import (
    httpserver,
    ioloop,
)
from tornado.options import (
    options,
    define,
    parse_command_line
)

import application

filename = os.path.dirname(__file__)
define('debug', default=True, type=bool, help='Open debug mode or '
       'not(default:enabled), false to disable it, true to enable it.')
define('port', default=8000, type=int, help='Set the port '
       'this application listen')
define('db_user', default='myblog', type=str)
define('db_pw', default='y1995kh221', type=str)
define('db_host', default='localhost', type=str)
define('db_name', default='blog', type=str)
define('article_path', default=os.path.join(filename,
                                            'static/user_data/user_article'))

define('static_path', default=os.path.join(filename, 'static'))
define('template_path', default=os.path.join(filename, 'template'))
define('dev', default=True, type=bool, help='develop env?')
define('shot_path', default=os.path.join(filename,
                                         'static/user_data/user_shots'))

reload(sys)
sys.setdefaultencoding('utf-8')


def main():
    parse_command_line()

    settings = dict(
        debug=options.debug,
        xsrf_cookies=True,
        cookie_secret='My_NAME_IS_KAIHANGYANG_PW_Y1995KH221',
        login_url=r'/login',
        template_path=options.template_path,
        static_path=options.static_path,
    )
    db_info = dict(
        db_host=options.db_host, db_name=options.db_name,
        db_user=options.db_user, db_pw=options.db_pw
    )
    article_path = options.article_path

    app = application.MainApplication(settings, db_info,
                                      article_path, options.shot_path,
                                      options.dev)

    server = httpserver.HTTPServer(app)
    server.listen(options.port)
    ioloop.IOLoop.current().start()

if __name__ == '__main__':
    main()
