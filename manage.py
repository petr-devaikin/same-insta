# -*- coding: utf-8 -*-
from flask.ext.script import Manager
from app import app

manager = Manager(app)

@manager.command
def hello():
    """
    Print hello
    """
    print "hello"


if __name__ == "__main__":
    manager.run()
