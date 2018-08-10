# Makefile

XCF2ATLAS=../xcf2atlas/xcf2atlas.py
MEDIA=www/media

.PHONY: media

all: media

media:
	$(XCF2ATLAS) --image=$(MEDIA)/sprites.png --json=$(MEDIA)/sprites.json rawdata/sprites/*.xcf --max-width=400

	$(XCF2ATLAS) --image=$(MEDIA)/office.png --json=$(MEDIA)/office.json rawdata/office.xcf

	inkscape --export-png=$(MEDIA)/title-text.png --export-area-page -z rawdata/title-text.svg

	./tools/genblockfont.py rawdata/boxy_bold_font_rev.xcf $(MEDIA)/boxybold
	./tools/genblockfont.py --char-spacing=1 rawdata/led_font.xcf $(MEDIA)/ledfont
