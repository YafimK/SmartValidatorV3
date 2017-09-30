"use strict";


const rsync = require("rsyncwrapper");
const fs = require('fs');
let talDirPath = "./conf/tal/";

function createTrustAnchor(file){
    const lines = file.split('\n');
    let values = [];
    lines.forEach((line)=>{
        let keyVal = line.split(' = ');
        values.push(keyVal[1]);
    });
    return {
        caName : values[0],
        certificateLocation : values[1],
        publicKey : values[2],
        prefetchUris : values[3],
    }
}

function parseTrustAnchors(){
    return new Promise((resolve, reject) => {
        fs.readdir(talDirPath, (err, files) => {
            if(err){
                reject(err);
            }  else {
                resolve(files);
            }
        });
    }).then((fileList) => {
        let trustAnchors = [];
        fileList.forEach((anchorFile)=>{
            let file = '';
            fs.createReadStream(talDirPath + anchorFile).on('data', (data)=>{
                file += data;
            }).on('end',()=>{
                let trustAnchor = createTrustAnchor(file);
                trustAnchors.push(trustAnchor);
            }).on('error', function(err){
                console.log(err);
                reject(err);
            });
        });
        resolve(trustAnchors);
    }).catch((err)=>
    console.log(err)).then(()=>{});
}

function fetchRoasByTrustAnchor(trustAnchor){
    const suffixPos = trustAnchor.indexOf(".tal");
    const anchorName = trustAnchor.substring(0, suffixPos);
    const rsyncCB = function (error, stdout, stderr, cmd) {
        console.log("stdout: ", stdout);
        console.log("cmd: ", cmd);
        if (error) {
            console.error(error);
        }
        if (stderr) {
            console.error(stderr);
        }
    };
    const options = {
        src: trustAnchor,
        dest: ".//ROAS/"+anchorName,
        recursive: true
    };
    rsync(options, rsyncCB);
}


function fetchRoas(){
    let trustAnchors = parseTrustAnchors();
    trustAnchors.then((tals)=>{
        console.log(tals);
        tals.forEach((trustAnchor)=>{
            fetchRoasByTrustAnchor(trustAnchor.prefetchUris);
        });
    });

}

fetchRoas();