## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-media-device.zip; \
	zip wc-resource-media-device.zip wc-resource-media-device.html package.json;