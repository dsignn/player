## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-soccer-benches.zip; \
	zip wc-resource-soccer-benches.zip  wc-resource-soccer-benches.html package.json;