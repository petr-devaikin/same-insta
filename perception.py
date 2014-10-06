from PIL import Image

def simple_perception(file_name):
    width = 8
    height = 8
    
    image = Image.open(file_name)
    small_grey = image.resize((width, height), Image.ANTIALIAS).convert('L')
    line = [image.getpixel((x, y))[0] for x in range(width) for y in range(height)]
    average = sum(line) / width / height
    return map(lambda p: p > average, line)


if __name__ == '__main__':
    res = simple_perception('test.jpg')
    print sum(res)
