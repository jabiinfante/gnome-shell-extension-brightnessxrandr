const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const WhatthecommitSettings = new GObject.Class({
  Name: "Whatthecommit-Settings",
  Extends: Gtk.Grid,

  _init: function(params) {
    this.parent(params);
    this.set_orientation(Gtk.Orientation.VERTICAL);
    this.set_row_spacing(10);
    this.margin = 20;

    this._settings = Convenience.getSettings();
    this._settings.connect("changed", Lang.bind(this, this._loadSettings));
    
    let showNotificationLabel = new Gtk.Label({
      label: "Notify copied message: ",
      xalign: 0,
      hexpand: true
    });

    this._showNotificationCheckbox = new Gtk.Switch();
    this._showNotificationCheckbox.connect(
      "notify::active",
      Lang.bind(this, function(button) {
        this._settings.set_boolean("show-notification-on-message", button.active);
      })
    );

    this.attach(showNotificationLabel, 1, 1, 1, 1);
    this.attach_next_to(this._showNotificationCheckbox, showNotificationLabel, 1, 1, 1);


    let includeMLabel = new Gtk.Label({
      label: "Copy message with \"-m\": ",
      xalign: 0,
      hexpand: true
    });

    this._includeMLabelCheckbox = new Gtk.Switch();
    this._includeMLabelCheckbox.connect(
      "notify::active",
      Lang.bind(this, function(button) {
        this._settings.set_boolean("include-m", button.active);
      })
    );

    this.attach(includeMLabel, 1, 2, 1, 1);
    this.attach_next_to(this._includeMLabelCheckbox, includeMLabel, 1, 1, 1);

    let quotesLabel = new Gtk.Label({
      label: "Copy with quotes: ",
      xalign: 0,
      hexpand: true
    });

    this._quotesNoneRadio = new Gtk.RadioButton({ group: null, label: "None", valign: Gtk.Align.START });
    this._quotesNoneRadio.connect('toggled', Lang.bind(this, this._onQuoteChanged, ''));

    this._quotesSimpleRadio = new Gtk.RadioButton({ group: this._quotesNoneRadio, label: "Simple '", valign: Gtk.Align.START });
    this._quotesSimpleRadio.connect('toggled', Lang.bind(this, this._onQuoteChanged, '\''));

    this._quotesDoubleRadio = new Gtk.RadioButton({ group: this._quotesNoneRadio, label: "Double \"", valign: Gtk.Align.START });
    this._quotesDoubleRadio.connect('toggled', Lang.bind(this, this._onQuoteChanged, '"'));

    this.attach(quotesLabel, 1, 3, 1, 1);
    this.attach_next_to(this._quotesNoneRadio, quotesLabel, 1, 1, 1);
    this.attach_next_to(this._quotesSimpleRadio, this._quotesNoneRadio, 1, 1, 1);
    this.attach_next_to(this._quotesDoubleRadio, this._quotesSimpleRadio, 1, 1, 1);


    const ackTxt = 'Using <a href="https://whatthecommit.com/">https://whatthecommit.com</a> by Nick Gerakines.';  
    const ackLabel = new Gtk.Label({ label: ackTxt, use_markup: true, xalign: Gtk.Align.CENTER, yalign: Gtk.Align.CENTER });
    this.attach(ackLabel, 1, 6, 10, 10);
      
    this._loadSettings();
  },
  _loadSettings: function() {
    this._showNotificationCheckbox.set_active(this._settings.get_boolean("show-notification-on-message"));
    this._includeMLabelCheckbox.set_active(this._settings.get_boolean("include-m"));
    
    this._quotesNoneRadio.active = this._settings.get_string('quotes') === '';
    this._quotesSimpleRadio.active = this._settings.get_string('quotes')=== '\'';
    this._quotesDoubleRadio.active = this._settings.get_string('quotes') === '"';
  },
  _onQuoteChanged: function(button, quote) {
    if (button.get_active()) {
      this._settings.set_string('quotes', quote);
  }
  }
});

function init() {}

function buildPrefsWidget() {
  let widget = new WhatthecommitSettings();
  widget.show_all();
  return widget;
}
