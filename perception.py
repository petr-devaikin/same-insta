from perception.advanced import SimplePerception, HuePerception
from perception.base import BasePerception
from PIL import Image
import os

def simple_perception(folder_1, folder_2):
    width = 8
    height = 8
    
    p = HuePerception(width, height)
    p2 = SimplePerception(width, height)

    hashes_1 = []
    hashes_2 = []

    for f in sorted(os.listdir(folder_1)):
        img = Image.open(os.path.join(folder_1, f))
        hashes_1.append((f, p.get_hash(img), p2.get_hash(img)))

    for f in sorted(os.listdir(folder_2)):
        img = Image.open(os.path.join(folder_2, f))
        hashes_2.append((f, p.get_hash(img), p2.get_hash(img)))

    for a in range(len(hashes_1)):
        for b in range(len(hashes_2)):
            k_grey = hashes_1[a][2] * hashes_2[b][2]
            k_hue = hashes_1[a][1] * hashes_2[b][1]
            #if min(hashes[a][1].values) == 360 and k_hue == 1: k = k_grey > 0.95
            if k_grey > 0.8 and k_hue > 0.8 and (k_grey > 0.95 or k_hue > 0.95):
                print hashes_1[a][0] + ' - ' + hashes_2[b][0]
                print str(k_hue) + ' / ' + str(k_grey) + ' = ' + str((k_hue + k_grey) / 2)

    #return p.get_hash(file_name)


if __name__ == '__main__':
    simple_perception('test_nika', 'test_kris')
