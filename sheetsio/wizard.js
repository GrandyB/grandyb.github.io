class Wizard {
    constructor() {
        this.steps = new Array();
        this.stepNumber = 0;
        
        this.wizardStepsDiv = document.getElementById("wizard-steps-inner");
        this.wizardBackButton = document.getElementById("wizard-button-back");
        this.wizardNextButton = document.getElementById("wizard-button-next");
        this.wizardFinishButton = document.getElementById("wizard-button-finish");

        this.wizardFinishButton.style.display = "none";
        this.wizardBackButton.disabled = true;
        this.wizardBackButton.onclick = () => this._wizardBack(); 
        this.wizardNextButton.onclick = () => this._wizardNext();
    }

    static setup() {
        let wizard = new Wizard();
        // Populate with steps
        let urlStep = new WizardSpreadsheetStep(wizard,
            "workbookURL", "Workbook URL",
            "First, enter your full spreadsheet URL into the box below.", "Ensure you have the sheet shared as 'anyone with the link can view'."
        );
        
        let nameStep = new WizardStep(wizard,
            "worksheetName", "Worksheet name",
            "Enter the name of the worksheet.", "The worksheet is the 'tab' within the Google Sheets workbook you wish to point SheetsIO at."
        );

        let projectStep = new WizardStep(wizard,
            "projectName", "Project name",
            "Give this config a name.", "This will guide the folder structure for the SheetsIO output files to live in."
        );
        wizard.populate(urlStep, nameStep, projectStep);
        return wizard;
    }

    populate(...steps) {
        for (var id in steps) {
            let step = steps[id];
            this.steps.push(step);
            this.wizardStepsDiv.appendChild(step.dom);
        }

        this.onInputUpdate(this.getCurrentStep());
    }

    onInputUpdate(step) {
        let valid = step.isValid();
        console.log(`'${step.id}' step Next button: ${valid ? 'enabled' : 'disabled'}`);
        this.wizardNextButton.disabled = !valid;
    }

    getCurrentStep() {
        return this.steps[this.stepNumber];
    }

    _wizardNext() {
        if (this.stepNumber + 1 >= this.numSteps-1) {
            console.log("wizardNext: hiding next/showing finish");
            this.wizardNextButton.style.display = "none";
            this.wizardFinishButton.style.display = "revert";
        } else {
            console.log("wizardNext: enabling back");
            this.wizardBackButton.disabled = false;
        }
        
        console.log(`Wizard#wizardNext: step ${this.stepNumber} > ${this.stepNumber+1}`);
        this.stepNumber++;
        this.wizardStepsDiv.style.left = "-"+(this.stepNumber*100)+"%";
        if (this.getCurrentStep()) {
            this.onInputUpdate(this.getCurrentStep());
        }
    }

    _wizardBack() {
        if (this.stepNumber != 0) {
            this.stepNumber--;
            this.wizardNextButton.innerHTML = "Next";
        }
        if (this.stepNumber == 0) {
            this.wizardBackButton.disabled = true;
        }
        this.wizardStepsDiv.style.left = "-"+(this.stepNumber*100)+"%";
        this.wizardFinishButton.style.display = "none";
        this.wizardNextButton.style.display = "revert";
    }
}

class WizardStep {
    constructor(wizard, id, name, text, hint) {
        this.wizard = wizard;
        this.id = id;
        this.name = name;
        this.text = text;
        this.hint = hint;

        this._populate();
    }

    _populate() {
        this.dom = document.createElement("div");
        this.dom.className = 'wizard-step';

        this.domLayout = document.createElement("div");
        this.domText = document.createElement("div");
        this.domText.className = `text ${this.id+"Text"}`;
        this.domText.innerHTML = this.text;
        this.domLayout.appendChild(this.domText);

        this.domHint = document.createElement("h6");
        this.domHint.innerHTML = this.hint;
        this.domHint.className = `hint ${this.id+"Hint"}`;
        this.domLayout.appendChild(this.domHint);

        this.domInput = document.createElement("input");
        this.domInput.id = this.id+"Input";
        this.domInput.size = 30;
        this.domInput.oninput = () => this.wizard.onInputUpdate(this);
        this.domLayout.appendChild(this.domInput);
    
        this.dom.appendChild(this.domLayout);
    }

    /** @return whether the step is able to continue. By default, if value is not empty.*/
    isValid() {
        return this.domInput.value.trim() !== "";
    }
}

class WizardSpreadsheetStep extends WizardStep {
    constructor(wizard, id, name, text, hint) {
        super(wizard, id, name, text, hint);
        this.valid = false;
    }

    _populate() {
        super._populate();
        
        // Splat the existing text input onchange; we want our workbookURLButton to update state
        this.domInput.onchange = () => { /* Do nothing. */ };

        var p = this.dom.getElementsByTagName("div")[0];

        /** Setup Google Sheet preview window. */
        let workbookURLButton = document.createElement("button");
        workbookURLButton.className = "workbookURLButton";
        workbookURLButton.innerHTML = "Preview";
        workbookURLButton.onclick = () => this._workbookURLClick();
        p.appendChild(workbookURLButton);
    }

    _workbookURLClick() {
        let workbookURLInput = document.getElementById(this.id+"Input");
        let gSheetPreviewFrame = document.getElementById("gsheet");
        let givenUrlVal = workbookURLInput.value;
        if (this._isGSheetUrl(givenUrlVal)) {
            gSheetPreviewFrame.src = givenUrlVal;
            this.valid = true;
        } else {
            alert("Please give a valid google sheet URL");
            workbookURLInput.value = "";
            this.valid = false;
        }
        this.wizard.onInputUpdate(this);
    }

    /** Very simple, very dumb checking as it doesn't really matter anyway. */
    _isGSheetUrl(url) {
        return url ? url.startsWith("https://docs.google.com/spreadsheets/d/") : false;
    }

    isValid() {
        return this.valid;
    }
}