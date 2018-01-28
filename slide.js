const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;



const Item = new Lang.Class({
    Name: 'Item',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function (device, isPrimary, brightness) {
        this.max = 1;
        this.min = 0.1;
        this.device = device;
        this.parent({ activate: false });
        this._buildUI(device + (isPrimary? '*':'')+ ' ');
        this.setValue(brightness);
    },
    _buildUI : function(deviceLbl) {

        const deviceLabel = new St.Label({
            style_class: "device",
            text: deviceLbl
        });
        this.actor.add(deviceLabel);
        
        this._slider = new Slider.Slider(0)
        this._slider.connect('value-changed', (slider, value) => this._sliderChanged(slider, value))
        this._slider.actor.accessible_name = 'Brightness'
        this.actor.add(this._slider.actor, {expand: true})

        this.brightnessLabel = new St.Label({
            style_class: "percent",
        });
        this.actor.add(this.brightnessLabel);
    },
    onChange: function(changeCallback) {
        this.changeCallback = changeCallback;
    },
    setValue: function(value) {
        this._slider.setValue(value);
        this._sliderChanged(this._slider, value);
    },
    increment: function() {
        this.setValue(this._slider.value + 0.05);
    },
    decrement: function() {
        this.setValue(this._slider.value - 0.05);
    },
    _sliderChanged: function(slider, value) {
        if (value < this.min) {
            this.setValue(this.min);
            return;
        }
        
        if (value > this.max) {
            this.setValue(this.max);
            return;
        }

        this.updateLabel(value);
        if (this.changeCallback) {
            this.changeCallback(this.device, value);
        }
    },
    updateLabel: function(value) {
        const targetBrightness = Math.round(value*100);
        this.brightnessLabel.set_text(String('(' + targetBrightness + '%)'));
    }

});
