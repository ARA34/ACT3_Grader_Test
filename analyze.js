/* --- Contains project analysis functions. --- */

/* Top-level analysis function, checks for appropraite number of sprites
   and initializes script analysis. */
function analyze(fileObj) {
    var pID = fileObj.info.projectID
    var gradeObj = new GradeEvents();
    gradeObj.grade(fileObj,pID);
    report(pID,gradeObj.requirements, gradeObj.extensions);
}

/* Returns pass/fail symbol. */
function checkbox(bool) {
    if (bool) return '✔️';
    else return '❌';
}

/* Reports results. */
function report(pID, reqs, exts) {
    var ret_list = [];
    var reqs_pass = true;
    var exts_pass = true;

    ret_list.push('Project ID: ' + pID);
    for(var x in reqs) {
        if(!reqs[x]) {
            reqs_pass = false;
        }
        ret_list.push(checkbox(reqs[x]) + 
            ' - ' + String(x));
    }
    ret_list.push('Extensions:');
    for(var x in exts) {
        if(!exts[x]) {
            exts_pass = false;
        }
        ret_list.push(checkbox(exts[x]) + 
            ' - ' + String(x));
    }

    if(exts_pass && reqs_pass) exceptional_projects++;
    else if (reqs_pass) passing_projects++;
    console.log(exceptional_projects);
    console.log(passing_projects);

    reports_list.push(ret_list);
    printReport();        
}