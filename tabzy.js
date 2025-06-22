function Tabzy(tabId, options = {}) {
  this.tabId = tabId.replace(/[^a-zA-Z0-9]/g, "");
  this.container = document.querySelector(tabId);
  if (!this.container) {
    console.error(`Tabzy: No container found for selector '${tabId}'`);
    return;
  }

  this.tabs = Array.from(this.container.querySelectorAll("li a"));
  if (!this.tabs.length) {
    console.error(`Tabzy: No tab found inside containers`);
  }

  this.panels = this.tabs
    .map((tab) => {
      const panel = document.querySelector(tab.getAttribute("href"));
      if (!panel) {
        console.error(
          `Tabzy: No panel found for selector '${tab.getAttribute("href")}'`
        );
      }
      return panel;
    })
    .filter(Boolean);
  if (this.panels.length !== this.tabs.length) {
    return;
  }

  this.opt = Object.assign(
    {
      remember: false,
      activeClassName: "element--active",
    },
    options
  );

  this._originalHTML = this.container.innerHTML;
  this._init();
}

Tabzy.prototype._init = function () {
  const params = new URLSearchParams(location.search);
  const tabSelector = params.get(this.tabId);

  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find(
        (tab) =>
          tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "") === tabSelector
      )) ||
    this.tabs[0];

  this.current = tab;
  console.log(tab);
  this._activeTab(tab, false, false);

  this.tabs.forEach(
    (tab) =>
      (tab.onclick = (event) => {
        event.preventDefault();
        this.check(tab);
      })
  );
};

Tabzy.prototype.check = function (tab) {
  if (tab !== this.current) {
    this.current = tab;
    console.log(this.current);
    this._activeTab(tab);
  }
};

Tabzy.prototype._activeTab = function (tab, allow = true, updateURL = true) {
  if (typeof this.opt.onChange === "function" && allow) {
    this.opt.onChange();
  }

  this.tabs.forEach((tab) =>
    tab.closest("li").classList.remove(this.opt.activeClassName)
  );
  tab.closest("li").classList.add(this.opt.activeClassName);

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;

  if (updateURL) {
    const params = new URLSearchParams(location.search);
    const paramValue = tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "");
    params.set(this.tabId, paramValue);
    history.replaceState(null, null, `?${params}`);
  }
};

Tabzy.prototype.switch = function (input) {
  let tabToActive =
    typeof input === "string"
      ? (tabToActive = this.tabs.find(
          (tab) => tab.getAttribute("href") === input
        ))
      : this.tabs.includes(input)
      ? (tabToActive = input)
      : null;
  this.check(tabToActive);
};

Tabzy.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
};
