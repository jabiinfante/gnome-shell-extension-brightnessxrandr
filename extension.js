const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const Gio = imports.gi.Gio;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;

const Me = imports.misc.extensionUtils.getCurrentExtension();

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

    log("hola");
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

    this._itemLabel = new PopupMenu.PopupBaseMenuItem({ activate: false })
    this.menu.addMenuItem(this._itemLabel)

    this._itemLabel.actor.add(new St.Icon({
      icon_name: "display-brightness-symbolic",
      style_class: "popup-menu-icon"
    }));

    this.currentBright = 50;
    this.currentLabel = new St.Label({
      text: 'eDP (70%)'      
    });
    this._itemLabel.actor.add(this.currentLabel);
    
    
    this._item = new PopupMenu.PopupBaseMenuItem({ activate: false })
    this.menu.addMenuItem(this._item)
    this._slider = new Slider.Slider(this.currentBright / 100)
    this._slider.connect('value-changed', (slider, value) => this._sliderChanged(slider, value))
    this._slider.actor.accessible_name = 'Brightness'
    this._item.actor.add(this._slider.actor, { expand: true })

  },
  _sliderChanged: function(slider, value) {
    this.currentBright = Math.round(value*100);
    this.currentLabel.set_text('eDP (' + this.currentBright+ '%)');

    Util.spawn(['xrandr', '--output', 'eDP', '--brightness', '' + (this.currentBright/100)]);
    
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
