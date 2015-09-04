bin    = "$(shell npm bin)"
stylus = $(bin)/stylus
sjs    = $(bin)/sjs
nw     = nw

# -- OPTIONS -----------------------------------------------------------
STYLUS_PATHS = -I node_modules/nib/lib \
               -I node_modules/entypo-stylus

# -- CONFIGURATION -----------------------------------------------------
STYLE_SRC = source/styles
STYLE_DST = www/styles

SRC_DIR = source/scripts
LIB_DIR = www/scripts
SRC     = $(wildcard $(SRC_DIR)/*.sjs $(SRC_DIR)/**/*.sjs)
TGT     = ${SRC:$(SRC_DIR)/%.sjs=$(LIB_DIR)/%.js}

VENDOR_DIR = source/vendor
VENDOR_SRC = $(wildcard $(VENDOR_DIR)/*.js)
VENDOR_TGT = ${VENDOR_SRC:$(VENDOR_DIR)/%.js=$(LIB_DIR)/%.js}

# -- COMPILATION -------------------------------------------------------
$(LIB_DIR)/%.js: $(SRC_DIR)/%.sjs
	mkdir -p $(dir $@)
	$(sjs) --readable-names \
	       --load-readtable jsx-reader \
	       --module sweet-fantasies/src/do \
	       --module lambda-chop/macros \
	       --module es6-macros/macros/destructure \
	       --module macros.operators/macros \
	       --module sparkler/macros \
	       --module adt-simple/macros \
	       --output $@ \
	       $<

$(LIB_DIR)/%.js: $(VENDOR_DIR)/%.js
	mkdir -p $(dir $@)
	cp $< $@

www/index.html: source/index.html
	mkdir -p www
	cp $< $@

# -- TASKS -------------------------------------------------------------
scripts: $(TGT) $(VENDOR_TGT)

clean:
	rm -rf www node_modules dist

static:
	cp -R source/fonts www
	cp -R source/images www

node_modules: package.json
	npm install

css:
	mkdir -p $(STYLE_DST)
	$(stylus) $(STYLUS_PATHS) $$STYLUS_OPTIONS -o $(STYLE_DST) $(STYLE_SRC)

css-watch:
	STYLUS_OPTIONS="--watch" $(MAKE) css

prebuild: www/index.html static css scripts node_modules

run-linux: prebuild
	./tools/fix-webkit
	LD_LIBRARY_PATH="$(pwd):$LD_LIBRARY_PATH" $(nw) .

run: prebuild
	$(nw) .


package.nw: prebuild
	rm -rf dist/app
	rm -f dist/package.nw
	mkdir -p dist/app
	cp package.json dist/app
	cp www dist/app -R
	cp resources dist/app -R
	cd dist/app && npm install --production
	cd dist/app && zip ../package.nw * -r

package: prebuild
	rm -rf dist
	$(MAKE) package.nw
	node ./tools/build
	./tools/fix-linux-builds
	./tools/zip-packages


.PHONY: css css-watch static clean package.nw
