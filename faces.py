import cv2
import os

def simple_perception(folder):
    face_cascade = cv2.CascadeClassifier('faces.xml')

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
