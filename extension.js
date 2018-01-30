const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
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

    // Timer flag for saving current device's brightness on change value
    this._saving = false;

    /**
     * Load whatthecommit scheme settings
     */
    this._settings = Convenience.getSettings();
    this._settings.connect("changed", Lang.bind(this, this.load));

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


    // Retrieve saved states
    this.savedStates = JSON.parse(this._settings.get_string('saved-values'));

    // Load needed configuration
    this.load();
    this.loadDevices();

    // If toggle is TRUE, then apply changes (Always save values anyway)
    if (this._settings.get_boolean('save-values')) {
      // We must wait a bit, or changes won't apply :/
      Mainloop.timeout_add(1500, Lang.bind(this, this._applySavedStates));
    }

  },
  load: function() {
    // Cache settings values
    this.onlyPrimaryOnScroll = this._settings.get_boolean('apply-only-primary')
    this.maxPercent = this._settings.get_int('max-value');
    this.minPercent = this._settings.get_int('min-value');
    
    if (this.devs) {
      for(let device of this.devs) {
        this.devs[device].maxPercent = this.maxPercent;
        this.devs[device].minPercent = this.minPercent;
      }
    }
  },
  loadDevices: function() {

    this.menu.removeAll();
    const devices = Xrandr.reloadDevices();
    this.devs = {};

    for(let device of devices) {
      
      this.devs[device.label] = new Slide.Item(device.label, device.primary);
      this.devs[device.label].maxPercent = this.maxPercent;
      this.devs[device.label].minPercent = this.minPercent;
      this.devs[device.label].setValue(device.brightness*100/this.maxPercent);
      this.devs[device.label].onChange(Lang.bind(this, this.valueChanged));
      this.menu.addMenuItem(this.devs[device.label]);
    }
  },
  valueChanged: function(device, value) {
    Xrandr.changeBrightness(device, value*this.maxPercent/100);
    this.savedStates[device] = value;
    if (!this.saving) {
      this.saving = true;
      Mainloop.timeout_add(4000, Lang.bind(this, this._saveCurrentStates));
    }
  },
  _saveCurrentStates: function() {
    this._settings.set_string('saved-values', JSON.stringify(this.savedStates));
    this.saving = false;
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

    // TODO: refactor... maybe read from this.devs?
    const devices = Xrandr.getDevices();
    for(let device of devices) {
      if (this.onlyPrimaryOnScroll) {
        device.primary && this.devs[device.label] && this.devs[device.label][method]();
      } else {
        this.devs[device.label] && this.devs[device.label][method]();
      }
    }

    return Clutter.EVENT_STOP;
    },
    _onScrollEvent: function(actor, event) {
      return this.scroll(event);
    },
    _applySavedStates: function() {
      for (let device in  this.savedStates) {
        if (this.devs[device]) {
          this.devs[device].setValue(this.savedStates[device]);
        }
      } 
    }
  
});

function init() {}

function enable() {
  brightnessCtrl = new Brightnessxrandr();
  Main.panel.addToStatusArea("Brightnessxrandr-control", brightnessCtrl);
}

function disable() {
  brightnessCtrl.destroy();
}
