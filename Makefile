# Makefile

BUNDLE=officetemp
XCF2ATLAS=../xcf2atlas/xcf2atlas.py
MEDIA=src/media

.PHONY: media watch

all: media watch

watch:
	cd src && watchify -v -t babelify -s $(BUNDLE) main.js -o $(BUNDLE).js

media:
	$(XCF2ATLAS) --image=$(MEDIA)/sprites.png --json=$(MEDIA)/sprites.json rawdata/sprites/*.xcf --max-width=400

	$(XCF2ATLAS) --image=$(MEDIA)/office.png --json=$(MEDIA)/office.json rawdata/office.xcf

	inkscape --export-png=$(MEDIA)/title-text.png --export-area-page -z rawdata/title-text.svg 

#dist:
#	test -d dist || mkdir dist 2> /dev/null
#	uglifyjs $(BUNDLE).js > dist/$(BUNDLE)-dist.js
#	cp page.js style.css *.md dist
#	cp -R contrib dist
#	cp -R media dist
#	cat index.html | sed 's/apdungeon.js/apdungeon-dist.js/' > dist/index.html
#	@echo ""
#	@echo "*** Distribution files stored in 'dist' ***"
