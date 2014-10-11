from perception.base import BasePerception
import os

def simple_perception(path):
    width = 8
    height = 8
    
    p = BasePerception(width, height)

    res = []
    hashes = [(f, p.get_hash(os.path.join(path, f))) for f in os.listdir(path)]
    for a in hashes:
        for b in hashes:
            if a != b:
                res.append(a[1] * b[1])
                if res[-1] > 0.3:
                    print a[0] + ' - ' + b[0]

    #return p.get_hash(file_name)


if __name__ == '__main__':
    simple_perception('test_img_1')
