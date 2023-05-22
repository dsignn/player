## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-soccer-scoreboard.zip; \
	zip -r wc-soccer-scoreboard.zip wc-soccer-scoreboard.js package.json node_modules Roboto-Regular.ttf digital-7.ttf