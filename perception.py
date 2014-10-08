from perception.base import BasePerception

def simple_perception(file_name):
    width = 8
    height = 8
    
    p = BasePerception(width, height)
    return p.get_hash(file_name)


if __name__ == '__main__':
    res = simple_perception('test.jpg')
    print res
