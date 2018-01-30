const Util = imports.misc.util;
const GLib = imports.gi.GLib;

const XRANDR    = "which xrandr";

let devices = [];

function reloadDevices() {
    devices = [];
    const xrandCMD = command() + ' --verbose';
    const { success, result } = _run(xrandCMD);

    const deviceRegExp = /([a-z0-9-]*)+\sconnected/i;
    const brightnessRegExp = /Brightness:\s+([0-9.]*)/i;
    let matches;
    if (success) {
        const lines = result.split("\n");
        let status = 0;
        let candidateDevice = {};

        for(let i = 0; i<lines.length;i++) {
            if (status === 0) { // searching for connected
                matches = deviceRegExp.exec(lines[i]);
                if(matches !== null) {
                    candidateDevice.label = matches[1];
                    candidateDevice.primary = lines[i].indexOf(' primary ') !== -1;
                    status = 1;
                }
            } else if (status === 1) { // seraching for brightness
                matches = brightnessRegExp.exec(lines[i]);
                if(matches !== null) {
                    candidateDevice.brightness = parseFloat(matches[1]);
                    if (candidateDevice.primary) {
                        devices.unshift(candidateDevice);
                    } else {
                        devices.push(candidateDevice);
                    }
                    status = 0;
                    candidateDevice = {};
                }
            }
        }
        
    } else {
        devices = [];
    }
    

    return devices;
}




function getDevices() {
    return devices;
}


reloadDevices();

function changeBrightness(device, brightness) {
    Util.spawn(['xrandr', '--output', device, '--brightness', '' + brightness]);
}


/**
 * Taken from: https://github.com/lucasdiedrich/gnome-display-switcher/blob/master/display-switcher%40lucas.diedrich.gmail.com/utils.js
 * _run:
 * @command: (obrigatory): The command to run on shell.
 *
 * Run an command passed by parameter and return the result containing the @success and @callback.
 *
 * Return: Result.{success  - True or False, if the command runned succefully or not. 
 *                 callback - The return of the executed command}
 */
function _run( command )
{
    let result;

    try 
    {
      let [res, out, err, status] = GLib.spawn_command_line_sync(command, null, null, null, null);
      result = {success: res, result: out.toString()};
    } 
    catch (e) 
    {
      result = {success: false, result: "ERROR " + e.toString() };      
    }

    return result;
}

/**
 * Taken from: https://github.com/lucasdiedrich/gnome-display-switcher/blob/master/display-switcher%40lucas.diedrich.gmail.com/utils.js
 * _getXRandr:
 *
 * Returns the actually localtion of the xrandr command, normally should 
 * be in /usr/bin/xrandr, we verify just for the case it doesnt.
 */
function command()
{
  return this._run(XRANDR).result;
}
