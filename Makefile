bin = $(shell npm bin)
stylus = $(bin)/stylus
sjs = $(bin)/sjs


# -- OPTIONS -----------------------------------------------------------
STYLUS_PATHS = -I node_modules/nib/lib \
               -I node_modules/entypo-stylus \
               -I node_modules/jsk-grid

# -- CONFIGURATION -----------------------------------------------------
STYLE_SRC = source/styles
STYLE_DST = www/styles

SRC_DIR = source/scripts
LIB_DIR = www/scripts
SRC     = $(wildcard $(SRC_DIR)/*.sjs $(SRC_DIR)/**/*.sjs)
TGT     = ${SRC:$(SRC_DIR)/%.sjs=$(LIB_DIR)/%.js}

# -- COMPILATION -------------------------------------------------------
$(LIB_DIR)/%.js: $(SRC_DIR)/%.sjs
	mkdir -p $(dir $@)
	$(sjs) --readable-names \
	       --module sweet-fantasies/src/do \
	       --module lambda-chop/macros \
	       --module es6-macros/macros/destructure \
	       --module macros.operators/macros \
	       --output $@ \
	       $<

# -- TASKS -------------------------------------------------------------
all: $(TGT)

clean:
	rm -rf $(LIB_DIR) $(STYLE_DST) node_modules

css:
	mkdir -p $(STYLE_DST)
	$(stylus) $(STYLUS_PATHS) $$STYLUS_OPTIONS -o $(STYLE_DST) $(STYLE_SRC)

css-watch:
	STYLUS_OPTIONS="--watch" $(MAKE) css

.PHONY: css css-watch clean
