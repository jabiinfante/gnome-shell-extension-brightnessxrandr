const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const BrightnessXrandsSettings = new GObject.Class({
  Name: "Whatthecommit-Settings",
  Extends: Gtk.Grid,

  _init: function(params) {
    this.parent(params);
    this.set_orientation(Gtk.Orientation.VERTICAL);
    this.set_row_spacing(10);
    this.margin = 20;

    this._settings = Convenience.getSettings();
    this._settings.connect("changed", Lang.bind(this, this._loadSettings));
    
    let minValueLabel = new Gtk.Label({
      label: "Min allowed value (prevent going black): ",
      xalign: 0,
      hexpand: true
    });
    this._minValueSpin = new Gtk.SpinButton();
    this._minValueSpin.set_sensitive(true);
    this._minValueSpin.set_range(0, 50);
    this._minValueSpin.set_increments(1, 2);
    this._minValueSpin.connect('value-changed', Lang.bind(this, function(w){
      var value = w.get_value_as_int();
      this._settings.set_int('min-value', value);
    }));


    this.attach(minValueLabel, 1, 1, 1, 1);
    this.attach_next_to(this._minValueSpin, minValueLabel, 1, 1, 1);


    let maxValueLabel = new Gtk.Label({
      label: "Max allowed value: ",
      xalign: 0,
      hexpand: true
    });
    this._maxValueSpin = new Gtk.SpinButton();
    this._maxValueSpin.set_sensitive(true);
    this._maxValueSpin.set_range(90, 200);
    this._maxValueSpin.set_increments(1, 2);
    this._maxValueSpin.connect('value-changed', Lang.bind(this, function(w){
      var value = w.get_value_as_int();
      this._settings.set_int('max-value', value);
    }));


    this.attach(maxValueLabel, 1, 2, 1, 1);
    this.attach_next_to(this._maxValueSpin, maxValueLabel, 1, 1, 1);


    let applyPrimaryLabel = new Gtk.Label({
      label: "Apply scroll event only on primary display: ",
      xalign: 0,
      hexpand: true
    });

    this._applyPrimaryCheckbox = new Gtk.Switch();
    this._applyPrimaryCheckbox.connect(
      "notify::active",
      Lang.bind(this, function(button) {
        this._settings.set_boolean("apply-only-primary", button.active);
      })
    );

    this.attach(applyPrimaryLabel, 1, 3, 1, 1);
    this.attach_next_to(this._applyPrimaryCheckbox, applyPrimaryLabel, 1, 1, 1);


    let rememberSettingsLabel = new Gtk.Label({
      label: "Remember brightness levels: ",
      xalign: 0,
      hexpand: true
    });

    this._saveValuesCheckbox = new Gtk.Switch();
    this._saveValuesCheckbox.connect(
      "notify::active",
      Lang.bind(this, function(button) {
        this._settings.set_boolean("save-values", button.active);
      })
    );

    this.attach(rememberSettingsLabel, 1, 4, 1, 1);
    this.attach_next_to(this._saveValuesCheckbox, rememberSettingsLabel, 1, 1, 1);


    this._loadSettings();
  },
  _loadSettings: function() {
    this._minValueSpin.set_value(this._settings.get_int('min-value'));
    this._maxValueSpin.set_value(this._settings.get_int('max-value'));
    this._applyPrimaryCheckbox.set_active(this._settings.get_boolean("apply-only-primary"));
    this._saveValuesCheckbox.set_active(this._settings.get_boolean("save-values"));
  
  }
});

function init() {}

function buildPrefsWidget() {
  let widget = new BrightnessXrandsSettings();
  widget.show_all();
  return widget;
}
