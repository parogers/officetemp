#!/usr/bin/env python3

import os
import xml.etree.ElementTree as ET
import collections
import subprocess
import sys
import io
import PIL
import PIL.Image
import argparse

def xcf_get_comment(path):
    out, err = subprocess.Popen([
        'exiftool',
        '-comment',
        '-b',
        path], stdout=subprocess.PIPE).communicate()
    return out.decode('UTF-8')

def xcf_to_pil(src):
    proc = subprocess.Popen(
        ['xcf2png', '-C', src], 
        stdout=subprocess.PIPE
    )
    out, err = proc.communicate()
    return PIL.Image.open(io.BytesIO(out))

def get_alpha_at(img, x, y):
    assert x < img.width, "%d/%d" % (x, img.width)
    assert y < img.height
    return img.getpixel((x, y))[3]

def is_row_clear(img, y):
    return all(get_alpha_at(img, x, y) == 0 for x in range(img.width))

def is_col_clear(img, x, y1, y2):
    return all(get_alpha_at(img, x, y) == 0 for y in range(y1, y2+1))

def get_char_info(img, chars, char_height):
    # Now parse out the character widths from the image
    CharInfo = collections.namedtuple('charinfo', (
        'x', 'y', 'width', 'height', 'char'))
    lst = []
    x = 1
    y = 1
    for char in chars:
        if char == '\n':
            x = 1
            y += char_height+1
            continue
        # Measure this character width
        width = 0
        while not is_col_clear(img, x+width, y, y+char_height):
            width += 1
        info = CharInfo(x, y, width, char_height, char)
        lst.append(info)
        x += width + 1
    return lst

def get_char_height(img):
    assert(is_row_clear(img, 0))

    y = 1
    height = 0
    while not is_row_clear(img, y):
        y += 1
        height += 1

    # Now verify the height across all remaining rows
    while y < img.height:
        assert(is_row_clear(img, y))
        y += 1

        if (y >= img.height): break

        for n in range(height):
            assert not is_row_clear(img, y)
            y += 1
    return height

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('src', help='Source XCF file')
    parser.add_argument('dest', help='Output PNG/FNT file')

    args = parser.parse_args(sys.argv[1:])

    # The outer image 1-pixel wide perimeter should be blank. The matrix of
    # characters should appear within that perimeter organized into rows of
    # constant height. The characters themselves can be variable width, 
    # but should have a 1-pixel wide gap between adjacient characters.
    img = xcf_to_pil(args.src)

    char_height = get_char_height(img)

    chars = xcf_get_comment(args.src)
    char_info = get_char_info(img, chars, char_height)

    # Dump the XML font file
    font_el = ET.Element('font')
    info_el = ET.SubElement(font_el, 'info')
    info_el.attrib = {
        'face' : os.path.basename(args.dest),
        'size' : str(char_height),
        'bold' : '0',
        'italic' : '0',
        'charset' : '',
        'unicode' : '0',
        'stretchH' : '100',
        'smooth' : '0',
        'aa' : '0',
        'padding' : '0,0,0,0',
        'spacing' : '1,1'
    }

    common_el = ET.SubElement(font_el, 'common')
    common_el.attrib = {
        'lineHeight' : str(char_height),
        'base' : str(char_height),
        'scaleW' : '512',
        'scaleH' : '512',
        'pages' : '1',
        'packed' : '0',
    }
    
    pages_el = ET.SubElement(font_el, 'pages')
    page_el = ET.SubElement(pages_el, 'page')
    page_el.attrib = {
        'id' : '0',
        'file' : os.path.basename(args.dest + '.png'),
    }

    chars_el = ET.SubElement(font_el, 'chars')
    chars_el.attrib['count'] = str(len(char_info))

    for info in char_info:
        char_el = ET.SubElement(chars_el, 'char')
        char_el.attrib = {
            'id' : str(ord(info.char)),
            'x' : str(info.x),
            'y' : str(info.y),
            'width' : str(info.width),
            'height' : str(info.height),
            'xoffset' : '0',
            'yoffset' : '0',
            'xadvance' : str(info.width+1),
            'page' : '0',
            'chnl' : '0',
            'letter' : info.char
        }

    img.save(args.dest + '.png')
    with open(args.dest + '.fnt', 'w') as fd:
        txt = ET.tostring(font_el).decode('UTF-8').replace('>', '>\n')
        fd.write(txt)

