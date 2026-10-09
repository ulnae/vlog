import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "三文鱼",
  description: "Welcome！",
  base: '/vlog/',
  head: [
    [
      'meta',
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
    ],
    [
      'link',
      { rel: 'icon', href: '/vlog/siam.svg' }
    ]
  ],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/siam.svg',
    siteTitle: '三文鱼',
    nav: [
      {
        text: '2025', link: '/2025/04/20', activeMatch: '/2025/'
      },
      {
        text: '2026', link: '/2026/01/28', activeMatch: '/2026/'
      },
      {
        text: '照片墙', link: '/photo'
      }
    ],

    // socialLinks: [
    //   { icon: 'juejin', link: 'https://juejin.cn/user/3650034336020430' },
    //   { icon: 'github', link: 'https://github.com/ulnae' },
    // ],

    sidebar: {
      '/2025/': [
        {
          text: '4月',
          collapsed: false,
          items: [
            { text: '20', link: '/2025/04/20' }
          ]
        },
        {
          text: '6月',
          collapsed: true,
          items: [
            { text: '01', link: '/2025/06/01' }
          ]
        },
        {
          text: '7月',
          collapsed: true,
          items: [
            { text: '14', link: '/2025/07/14' },
            { text: '26', link: '/2025/07/26' }
          ]
        },
        {
          text: '8月',
          collapsed: true,
          items: [
            { text: '29', link: '/2025/08/29' },
          ]
        },
        {
          text: '9月',
          collapsed: true,
          items: [
            { text: '26', link: '/2025/09/26' },
          ]
        },
        {
          text: '11月',
          collapsed: true,
          items: [
            { text: '06', link: '/2025/11/06' },
            { text: '12', link: '/2025/11/12' },
            { text: '18', link: '/2025/11/18' },
            { text: '19', link: '/2025/11/19' },
            { text: '23', link: '/2025/11/23' },
            { text: '26', link: '/2025/11/26' },
          ]
        },
        {
          text: '12月',
          collapsed: true,
          items: [
            { text: '05', link: '/2025/12/05' },
            { text: '07', link: '/2025/12/07' },
            { text: '13', link: '/2025/12/13' },
            { text: '25', link: '/2025/12/25' },
          ]
        },
      ],
      '/2026/': [
        {
          text: '1月',
          collapsed: false,
          items: [
            { text: '17', link: '/2026/01/17' },
            { text: '28', link: '/2026/01/28' }
          ]
        },
        {
          text: '2月',
          collapsed: true,
          items: [
            { text: '08', link: '/2026/02/08' },
            { text: '14', link: '/2026/02/14' },
          ]
        },
        {
          text: '3月',
          collapsed: true,
          items: [
            { text: '05', link: '/2026/03/05' },
            { text: '31', link: '/2026/03/31' },
          ]
        },
        {
          text: '4月',
          collapsed: true,
          items: [
            { text: '30', link: '/2026/04/30' },
          ]
        },
        {
          text: '5月',
          collapsed: true,
          items: [
            { text: '31', link: '/2026/05/31' },
          ]
        },
        {
          text: '6月',
          collapsed: true,
          items: [
            { text: '13', link: '/2026/06/13' },
            { text: '25', link: '/2026/06/25' },
            { text: '26', link: '/2026/06/26' },
            { text: '29', link: '/2026/06/29' },
            { text: '30', link: '/2026/06/30' },
          ]
        },
        {
          text: '7月',
          collapsed: true,
          items: [
            { text: '01', link: '/2026/07/01' },
            { text: '04', link: '/2026/07/04' },
            { text: '08', link: '/2026/07/08' },
            { text: '09', link: '/2026/07/09' },
            { text: '13', link: '/2026/07/13' },
          ]
        },
        {
          text: '9月',
          collapsed: true,
          items: [
            { text: '26', link: '/2026/09/26' },
          ]
        },
        {
          text: '10月',
          collapsed: true,
          items: [
            { text: '04', link: '/2026/10/04' },
            { text: '06', link: '/2026/10/06' },
          ]
        },
      ]
    },

    // footer: {
    //   message: 'Released under the MIT License.',
    //   copyright: 'Copyright © 2019-present Eug'
    // },


    search: {
      provider: 'local',
      options: {
        locales: {
          root: { // 如果你想翻译默认语言，请将此处设为 `root`
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '输入',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc'
                }
              }
            }
          }
        }
      }
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'long',
        timeStyle: 'medium',
        hourCycle: 'h12'
      }
    },

    editLink: {
      pattern: 'https://github.com/ulnae/vlog/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    darkModeSwitchLabel: '模式',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',

    externalLinkIcon: true,

    outline: {
      label: '页面导航'
    }



  },
  ignoreDeadLinks: [
    // 忽略所有 localhost 链接
    /^https?:\/\/localhost/,
  ],


  markdown: {
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoad: true
    },
    // lineNumbers: true

  },

  vite: {
    server: {
      host: '0.0.0.0',
    },
    plugins: [
    ],
    build: {
      rollupOptions: {
        output: {
          // 配置代码分割
          codeSplitting: {
            groups: [
              {
                test: /node_modules\/medium-zoom/,
                name: 'medium-zoom',
              },
              {
                test: /node_modules\/@giscus\/vue/,
                name: 'giscus',
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        // docs/.vitepress/theme
        '@theme': fileURLToPath(new URL('./theme', import.meta.url)),

        // docs/.vitepress/theme/utils
        '@utils': fileURLToPath(new URL('./theme/utils', import.meta.url)),

        // docs 目录
        '@docs': fileURLToPath(new URL('../', import.meta.url)),
      },
    },
  }

})
