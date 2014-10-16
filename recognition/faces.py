import cv2
import os
from urllib2 import urlopen
import numpy as np

face_cascade = cv2.CascadeClassifier('recognition/faces.xml')

def get_faces(url):
    request = urlopen(url)
    img_array = np.asarray(bytearray(request.read()), dtype=np.uint8)
    image = cv2.imdecode(img_array, -1)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, minNeighbors=5)
    return faces

def get_faces_from_file(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=4,
        minSize=(30, 30),
        flags = cv2.cv.CV_HAAR_SCALE_IMAGE
    )
    return faces

def simple_perception(folder):
    for f in sorted(os.listdir(folder)):
        image_path = os.path.join(folder, f)
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags = cv2.cv.CV_HAAR_SCALE_IMAGE
        )
        print f + ' - ' + str(len(faces))


if __name__ == '__main__':
    simple_perception('test_nika')
