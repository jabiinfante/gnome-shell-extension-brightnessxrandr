const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Clutter = imports.gi.Clutter;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Xrandr = Me.imports.xrandr;
const Slide = Me.imports.slide;

const Convenience = Me.imports.convenience;

let brightnessCtrl;

const Brightnessxrandr = new Lang.Class({
  Name: "Brightnessxrandr",
  Extends: PanelMenu.Button,

  _init: function() {
    this.parent(0, "Brightnessxrandr");

    this.reactive = true;
    this.can_focus = true;
    this.x_fill =  true;
    this.y_fill = false;
    this.track_hover = true;

    /**
     * Load whatthecommit scheme settings
     */
    this._settings = Convenience.getSettings();

    /**
     * ui
     */
    let _topBox = new St.BoxLayout();
    this.icon = new St.Icon({
      icon_name: "display-brightness-symbolic",
      style_class: "system-status-icon"
    });
    _topBox.add_child(this.icon);
    this.actor.add_actor(_topBox);
    this.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
    this.loadDevices();

  },

  loadDevices: function() {

    this.menu.removeAll();
    const devices = Xrandr.reloadDevices();
    this.devs = {};
    for(let device of devices) {
      this.devs[device.label] = new Slide.Item(device.label, device.primary, device.brightness);
      this.devs[device.label].onChange(Lang.bind(this, this.valueChanged));
      this.menu.addMenuItem(this.devs[device.label]);
    }

  },
  valueChanged: function(device, value) {
    Xrandr.changeBrightness(device, value);
  },
  scroll: function(event) {
    let direction = event.get_scroll_direction();
    let delta;

    if (event.is_pointer_emulated())
        return Clutter.EVENT_PROPAGATE;

    if (direction == Clutter.ScrollDirection.DOWN) {
        delta = -1;
    } else if (direction == Clutter.ScrollDirection.UP) {
        delta =  1;
    } else if (direction == Clutter.ScrollDirection.SMOOTH) {
        let [dx, dy] = event.get_scroll_delta();
        delta = -dy * 1;
    }

    let method;
    if (delta > 0) {
      method = 'increment';
    } else {
      method = 'decrement';
    }

    const devices = Xrandr.getDevices();
    for(let device of devices) {
      device.primary && this.devs[device.label] && this.devs[device.label][method]();
    }

    return Clutter.EVENT_STOP;
},

_onScrollEvent: function(actor, event) {
    return this.scroll(event);
},
  
});

function init() {}

function enable() {
  brightnessCtrl = new Brightnessxrandr();
  Main.panel.addToStatusArea("Brightnessxrandr-control", brightnessCtrl);
}

function disable() {
  brightnessCtrl.destroy();
}
