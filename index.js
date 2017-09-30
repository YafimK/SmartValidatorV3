/**
 * Created by fimka on 30/09/2017.
 */


const rsync = require("rsyncwrapper");

const rsyncCB = function(error, stdout, stderr, cmd){
    console.log("stdout: ",stdout);
    console.log("cmd: ",cmd);
    if(error){
        console.error(error);
    }
    if(stderr){
        console.error(stderr);
    }
};

options = {
    src: "rsync://rpki.apnic.net/member_repository/",
    dest: ".//ROAS/",
    recursive: true
};



rsync(options, rsyncCB);