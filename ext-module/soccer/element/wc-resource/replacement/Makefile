## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-soccer-replacement.zip; \
	zip wc-resource-soccer-replacement.zip  wc-resource-soccer-replacement.html package.json;