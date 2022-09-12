## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-ice-hockey-scoreboard.zip; \
	zip -r wc-resource-ice-hockey-scoreboard.zip wc-resource-ice-hockey-scoreboard.js package.json node_modules