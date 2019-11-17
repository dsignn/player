## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-soccer-player.zip; \
	zip wc-resource-soccer-player.zip  wc-resource-soccer-player.html package.json;