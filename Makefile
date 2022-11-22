usage = "\
Usage: make [target] \n\n\
Available targets:\n\
pre                                         安装/更新依赖\n\
build                                       项目打包\n\
clean-node-modules                          清理所有依赖\n\
clean                                       清理打包结果\n\
"

# Build PC dev arguments
dev_args =
ifeq ($(no-dll), true)
	dev_args := $(dev_args) --no-dll
endif
ifdef entry
	dev_args := $(dev_args) $(foreach item,$(entry),-e $(item))
endif

# Build wap dev arguments
wap_dev_args =
ifdef entry
	wap_dev_args := $(wap_dev_args) --entry $(entry)
endif

ppnpm = pnpm --registry=https://registry.npmjs.org/ --frozen-lockfile

usage:
	@echo $(wap_dev_args)
	@echo $(usage)

pre: check-pnpm-version
	$(ppnpm) install
	make install-vite-v2.x
	make install-vite-v3.x

build: check-pnpm-version
	$(ppnpm) build
	make build-vite-v2.x
	make build-vite-v3.x

clean-node-modules:
	rm -rf node_modules
	make clean-vite-v2.x-node-modules
	make clean-vite-v3.x-node-modules

clean:
	rm -rf dist
	make clean-vite-v2.x
	make clean-vite-v3.x
	
check-pnpm-version:
	./scripts/check-pnpm-version.sh

install-vite-v2.x: 
	cd examples && cd vite-v2.x && $(ppnpm) install
	make link-vite-v2.x

install-vite-v3.x: 
	cd examples && cd vite-v3.x && $(ppnpm) install
	make link-vite-v3.x

link-vite-v2.x:
	cd examples && cd vite-v2.x && cd node_modules && cd vite-plugin-externals-extension && rm -rf dist && ln -s ../../../../../../../dist dist

link-vite-v3.x:
	cd examples && cd vite-v3.x && cd node_modules && cd vite-plugin-externals-extension && rm -rf dist && ln -s ../../../../../../../dist dist

build-vite-v2.x:
	cd examples && cd vite-v2.x && $(ppnpm) build

build-vite-v3.x: 
	cd examples && cd vite-v3.x && $(ppnpm) build

clean-vite-v2.x-node-modules:
	cd examples && cd vite-v2.x && rm -rf node_modules

clean-vite-v3.x-node-modules:
	cd examples && cd vite-v3.x && rm -rf node_modules

clean-vite-v2.x:
	cd examples && cd vite-v2.x && rm -rf dist

clean-vite-v3.x:
	cd examples && cd vite-v3.x && rm -rf dist