---
layout: page
footer: false
---

<div class="iframe-full">
  <iframe
    src="./p.html"
    frameborder="0"
    allowfullscreen
  ></iframe>
</div>

<style>
/* markdown 里的 style 默认是全局的，类名取独特一点即可 */
.iframe-full {
  position: fixed;
  top: var(--vp-nav-height); /* 导航栏高度 */
  right: 0;
  bottom: 0;
  left: 0;
}

.iframe-full iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>