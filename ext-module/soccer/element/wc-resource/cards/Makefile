## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-soccer-cards.zip; \
	zip wc-resource-soccer-cards.zip  wc-resource-soccer-cards.html package.json;