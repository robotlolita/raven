bin = $(shell npm bin)
stylus = $(bin)/stylus

# -- OPTIONS -----------------------------------------------------------
STYLUS_PATHS = -I node_modules/nib/lib \
               -I node_modules/jumperskirt/stylus \
               -I node_modules/entypo-stylus

STYLE_SRC = source/stylus
STYLE_DST = styles

# -- TASKS -------------------------------------------------------------
node_modules: package.json
	npm install

css: node_modules
	mkdir -p $(STYLE_DST)
	$(stylus) $(STYLUS_PATHS) $(STYLUS_OPTIONS) -o $(STYLE_DST) $(STYLE_SRC)

watch-css:
	STYLUS_OPTIONS="--watch" $(MAKE) css

clean:
	rm -rf $(STYLE_DST)

.PHONY: css watch-css clean
