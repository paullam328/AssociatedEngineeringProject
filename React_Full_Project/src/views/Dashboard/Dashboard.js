import React, {Component} from "react";
import axios from 'axios';
import * as ReactDOM from 'react-dom'
import {
    Badge,
    Button,
    Row,
    Col,
    Collapse,
    Card,
    CardHeader,
    CardBlock,
    CardFooter,
    Form,
    FormGroup,
    FormText,
    Label,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    TabContent, TabPane, Nav, NavItem, NavLink, CardTitle, CardText,
} from "reactstrap";
import classnames from 'classnames';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import './Dashboard.css'

var responseJSON = {"results": []};
var records = [];
var dashGlobal = {};
//let filters = [];
var filters = [{"column": "createdAt", "type": "LT", "value": [2009, 12, 31]}, {
    "column": "createdAt",
    "type": "GT",
    "value": [2005, 1, 1]
}];
var server = "http://13.59.251.84:8080";
//var server = "http://localhost:8080";
var name;


function getDate(input) { //converts the JSON's string date into an array of ints, [year, month, day]
    return input.split("-", 3).map(function (x) {
        return parseInt(x);
    });
}

//so u want me to change to column? I dont mind
function callFilter(row, index, arr) {
    //console.log("ensure the filters are correct" + JSON.stringify(filters));
    //console.log("JSON.stringify(this): " + JSON.stringify(this));

    for (let criterion of this)
        //for (var criterion = 0; criterion < this.length; criterion++)
    {
        //console.log("criterion is" + JSON.stringify(criterion));
        //criterion = {"column":"createdAt","type":"EQ","value":["2015","05","05"]}
        //criterion is 0 now

        //why dont we just try 2004/05/05 instead then

        if (['typeId', 'locationId', 'stateId', 'classId'].indexOf(criterion.column) !== -1) {
            //EQ means only include those with value,
            //otherwise means exclude those with value
            if (criterion.type === "EQ") {
                if (criterion.value.indexOf(row[criterion.column]) === -1) return false;
            }
            else if (criterion.value.indexOf(row[criterion.column]) !== -1) return false;
        }
        else if (['UpdatedAt', 'CreatedAt', 'ClosedAt'].indexOf(criterion.column) !== -1)// but front end is not capitalized, so
        // this will equate to if(false)
        {
            //console.log("row[criterion.column] is:" + JSON.stringify(row[criterion.column]));//why is it 2004?
            //we can assume the hr
            let date = getDate(row[criterion.column]);
            console.log("date is: " + JSON.stringify(date));
            console.log("criterion.value is: " + JSON.stringify(criterion.value));
            switch (criterion.type) {
                case 'GT': //after this date
                    if (date[0] < parseInt(criterion.value[0]) || date[1] < parseInt(criterion.value[1]) || date[2] < parseInt(criterion.value[2])) return false;
                    break;
                case 'EQ': //at this date (probably more like year)
                    if (date[0] !== parseInt(criterion.value[0]) || date[1] !== parseInt(criterion.value[1]) || date[2] !== parseInt(criterion.value[2])) return false;
                    break;
                case 'LT': //after this date
                    if (date[0] > parseInt(criterion.value[0]) || date[1] > parseInt(criterion.value[1]) || date[2] > parseInt(criterion.value[2])) return false;
                    break;
                default: //invalid comparator
                    throw "filter::invalid comparator " + criterion.type;
            }
        }
    }
    return true;
}

//filterJSON takes two parameters
//input is an array of records
//criteria is an array of criterions
//each criterion has at least 3 elements
//column indicates which record column it operates on
//type is the comparator to use. GT, EQ, LT
//value is the value to compare to

function filterJSON(input, crit) {
    console.log("input is: " + JSON.stringify(input));
    if (input === null || input === undefined) return null;
    return input.filter(callFilter, crit);
}

//given a valid JSON response, updates global variables and tables
function globalUpdate(response) {
    //responseJSON = response;
    console.log("length before " + response.results.length);
    //records = filterJSON(response.results, filters);
    console.log("responseJSON.results: " + response.results);
    records = response.results;
    console.log("length after" + records.length);
    console.log(records);
    dashGlobal.update();
}

class BoxRow extends React.Component {
    render() {
        const box = this.props.box;

        return (
            <tr>
                <th>BOX {box.id}</th>
                <th>{box.attrId}</th>
                <th>{box.recordId}</th>
                <th>{box.value}</th>
            </tr>
        );
    }
}

class RecordRow extends React.Component {
    constructor(props) {
        super(props);
        this.togglePrintOptions = this.togglePrintOptions.bind(this);
        this.printRecordLabel = this.printRecordLabel.bind(this);
        this.printEndTabLabel = this.printEndTabLabel.bind(this);
        this.state = {showPrintOptions: false};
    }

    printRecordLabel() {
        this.togglePrintOptions();
        this.props.addToRecordLabels(this.props.record)         // Full.addToRecordLabels()
    }

    printEndTabLabel() {
        this.props.addToEndTabLabels(this.props.record)         // Full.addToEndTabLabels()
    }

    togglePrintOptions() {
        this.setState({
            showPrintOptions: !this.state.showPrintOptions
        });
    }

    render() {
        const record = this.props.record;

        return (
            <tr>
                <th>RECORD {record.id}
                    <Dropdown isOpen={this.state.showPrintOptions} toggle={this.togglePrintOptions}>
                        <DropdownToggle className="nav-link dropdown-toggle">
                            <i className="fa fa-print"></i>
                        </DropdownToggle>
                        <DropdownMenu right className={this.state.showPrintOptions ? 'show' : ''}>
                            <DropdownItem>
                                <div onClick={this.printRecordLabel}>+ Record Label</div>
                            </DropdownItem>
                            <DropdownItem>
                                <div onClick={this.printEndTabLabel}>+ End Tab Label</div>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </th>
                <th>{record.number}</th>
                <th>{record.consignmentCode}</th>
                <th>{record.title}</th>
                <th>{record.locationId}</th>
            </tr>
        );
    }
}

//animated fadeIn
class ResultsTable extends React.Component {
    render() {
        if (this === undefined || this.props === undefined || this.props.results === undefined) {
            return (
                <div className="footerTable">
                    <Row>
                        <Col>
                            <Card>
                                <CardBlock className="card-body">
                                </CardBlock>
                            </Card>
                        </Col>
                    </Row>
                </div>
            );
        }
        let columns = [];
        if (this.props.results.length > 0) {
            for (let key in this.props.results[0]) {
                if (this.props.results[0].hasOwnProperty(key)) {
                    //TODO: Replace header with user-readable string
                    columns.push({"Header": key.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1"), "accessor": key});
                }
            }
        }

        let that = this;
        return (
            <div>
                <Row>
                    <Col>
                        <Card>
                            <CardBlock className="card-body">
                                <ReactTable
                                    data={that.props.results}
                                    columns={columns}
                                />
                            </CardBlock>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

class SearchBar extends React.Component {
    //TODO: PAUL'S CODE


    constructor(props) {
        super(props);
        this.state = {
            Number: 0,
            title: 0,
            statesName: '',
            consignmentCode: '',

            typeId: '',
            locationName: [],
            classification: '',

            //FOR QUICKSEARCH
                quickSearchAttr: "recordNum",

            createdyyyy: '',
            createdmm: '',
            createddd: '',

            createdFromyyyy: '',
            createdFrommm: '',
            createdFromdd: '',

            createdTillyyyy: '',
            createdTillmm: '',
            createdTilldd: '',

            updatedyyyy: '',
            updatedmm: '',
            updateddd: '',

            updatedFromyyyy: '',
            updatedFrommm: '',
            updatedFromdd: '',

            updatedTillyyyy: '',
            updatedTillmm: '',
            updatedTilldd: '',

            //TODO: closedAt

            closedyyyy: '',
            closedmm: '',
            closeddd: '',

            closedFromyyyy: '',
            closedFrommm: '',
            closedFromdd: '',

            closedTillyyyy: '',
            closedTillmm: '',
            closedTilldd: '',

            stateId: '',
            retentionSchedules: '',

            projectFunction: '',
            projectManager: '',
            projectClientName: '',
            proposalFieldOfPractice: '',
            proposalManager: '',
            proposalClientName: '',

            collapseCreated: false,
            collapseCreatedFromTill: true,
            collapseCreatedFrom: true,
            collapseCreatedTill: true,
            collapseUpdated: false,
            collapseUpdatedFromTill: true,
            collapseUpdatedFrom: true,
            collapseUpdatedTill: true,

            //TODO: closedAt
            collapseClosed: false,
            collapseClosedFromTill: true,
            collapseClosedFrom: true,
            collapseClosedTill: true,

            numberOrConsignmentCode: '',

            fullTextSearch: '',

            activeTab: '1',

            dropdownOpen: false,

            dropdownValue: "Please select quick search attribute:",

            typeDropDownOpen: false,

            arrayOfSelectedTypes: [],

            locationDropDownOpen: false,

            arrayOfSelectedLocations: [],

            leftClickingDropDownCheckboxes: false,

            classDropDownOpen: false,

            arrayOfSelectedClasses: [],

            stateDropDownOpen: false,

            arrayOfSelectedStates: [],

            schedDropDownOpen: false,

            arrayOfSelectedScheds: [],

            rolesName: '',

            radioButtonValue: '',

            containerNumber: ''


            //serverLocationDropDown: []

        };
        //this.getFromServer = this.getFromServer.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitQuickSearch = this.handleSubmitQuickSearch.bind(this);
        this.handleSubmitFullTextSearch = this.handleSubmitFullTextSearch.bind(this);
        this.handleSubmitRecordTypeSpecificSearch = this.handleSubmitRecordTypeSpecificSearch.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.toggleAttr = this.toggleAttr.bind(this);
        //this.changeValue = this.changeValue.bind(this);
        this.addRole = this.addRole.bind(this);

        this.isCheckedQuickSearchAttr = this.isCheckedQuickSearchAttr.bind(this);

        this.toggleCollapseCreated = this.toggleCollapseCreated.bind(this);
        this.toggleCollapseCreatedFrom = this.toggleCollapseCreatedFrom.bind(this);
        this.toggleCollapseCreatedTill = this.toggleCollapseCreatedTill.bind(this);
        this.toggleCollapseUpdated = this.toggleCollapseUpdated.bind(this);
        this.toggleCollapseUpdatedFrom = this.toggleCollapseUpdatedFrom.bind(this);
        this.toggleCollapseUpdatedTill = this.toggleCollapseUpdatedTill.bind(this);

        //TODO: closedAt
        this.toggleCollapseClosed = this.toggleCollapseClosed.bind(this);
        this.toggleCollapseClosedFrom = this.toggleCollapseClosedFrom.bind(this);
        this.toggleCollapseClosedTill = this.toggleCollapseClosedTill.bind(this);

        this.toggleTypeDropdown = this.toggleTypeDropdown.bind(this);
        this.toggleTypeCheckbox = this.toggleTypeCheckbox.bind(this);

        this.toggleLocationDropdown = this.toggleLocationDropdown.bind(this);
        this.toggleLocationCheckbox = this.toggleLocationCheckbox.bind(this);

        this.toggleClassDropdown = this.toggleClassDropdown.bind(this);
        this.toggleClassCheckbox = this.toggleClassCheckbox.bind(this);

        this.toggleStateDropdown = this.toggleStateDropdown.bind(this);
        this.toggleStateCheckbox = this.toggleStateCheckbox.bind(this);

        this.toggleSchedDropdown = this.toggleSchedDropdown.bind(this);
        this.toggleSchedCheckbox = this.toggleSchedCheckbox.bind(this);

        //TODO: list out dropdown items
        this.displaySelectedTypeButtons = this.displaySelectedTypeButtons.bind(this);
    }

    //fetch from server from the very beginning:
    componentWillMount() {
        this.getTypeFromServerThenTransformToHtml();
        this.getLocationFromServerThenTransformToHtml();
        this.getClassFromServerThenTransformToHtml();
        this.getStateFromServerThenTransformToHtml();
        this.getSchedFromServerThenTransformToHtml();
    }

    sendHttpCall(method, url, json) {
        console.log("in sendHttpCall()");
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else if (xhr.status >= 300) {
                    reject(0);
                }
            };

            if (method === "POST" || method === "PUT" || method === "DELETE") {
                let body = JSON.stringify(json);
                xhr.send(body);
            } else {
                xhr.send();
            }
        });
    }


    populateConfigureTab() {
        console.log("in populateConfigureTab()");
        let json = {};
        let url = "/roles/";
        let method = "GET";
        console.log(server + url);

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
    }

    addRole() {
        console.log("in addRole()");

        let json = {rolesName: this.state.rolesName};
        console.log(JSON.stringify(json));
        let url = "/roles/";
        let method = "POST";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
    }

    handleSubmitQuickSearch(event) {
        console.log("SearchButtonValueIs:" + this.state.quickSearchAttr);

        let input = this.state.numberOrConsignmentCode.replace(" ", "");

        if (input.length < 5) {
            console.log("Invalid input - input too short");
            // TODO: show invalid input warning on UI

        } else {
            let json = {};
            let url = "";
            if (this.state.quickSearchAttr == "recordNum") {
                console.log(JSON.stringify({Number: this.state.numberOrConsignmentCode}));
                url = "/records/number";
                json = {Number: this.state.numberOrConsignmentCode};
            } else if (this.state.quickSearchAttr == "boxNum") {
                console.log(JSON.stringify({boxNumber: this.state.numberOrConsignmentCode}));
                url = "/records/boxNumber";
                json = {boxNumber: this.state.numberOrConsignmentCode};
            } else {
                console.log(JSON.stringify({consignmentCode: this.state.numberOrConsignmentCode}));
                url = "/records/consignmentCode";
                json = {consignmentCode: this.state.numberOrConsignmentCode};
            }

            let method = "POST";
            this.sendHttpCall(method, server + url, json).then(function (result) {
                globalUpdate(result);
            });
        }
        event.preventDefault();
    }

//var sampleFilterParam = {"filter":[{"name":"locationId","type":"EQ","value":"5"},{"name":"year","type":"GT","value":"2005"}]}


    handleSubmitFullTextSearch(event) {
        var arrayOfFilters = [];
        var sampleFilterParam = {"CreatedStart":'a',"UpdatedStart":"b","TypeId":[5,20,25]};


        //push into array of filter one by one would be easier I guess
//result[1]['filter']

        //Beginning of Old Filter
        for (var i = 0; i < this.state.arrayOfSelectedTypes.length; i++) {
            arrayOfFilters.push({name: "TypeId", type: "EQ", value: this.state.arrayOfSelectedTypes[i]['id']});
        }

        for (var i = 0; i < this.state.arrayOfSelectedLocations.length; i++) {
            arrayOfFilters.push({name: "LocationId", type: "EQ", value: this.state.arrayOfSelectedLocations[i]});
        }


        for (var i = 0; i < this.state.arrayOfSelectedClasses.length; i++) {
            arrayOfFilters.push({name: "ClassId", type: "EQ", value: this.state.arrayOfSelectedClasses[i]});
        }

        arrayOfFilters.push(
            //for: createdAt
            //first case: one date
            (this.state.collapseCreated
            && this.state.createdyyyy != ""
            && this.state.createdmm != ""
            && this.state.createddd != ""
                ? {
                    column: "CreatedAt",
                    type: "EQ",
                    value: [this.state.createdyyyy, this.state.createdmm, this.state.createddd]
                } : undefined),


            //second case: from beginning to date

            (!this.state.collapseCreated
            && this.state.collapseCreatedTill
            && this.state.createdTillyyyy != ""
            && this.state.createdTillmm != ""
            && this.state.createdTilldd != ""
                ? {
                    column: "CreatedAt",
                    type: "LT",
                    value: [this.state.createdTillyyyy, this.state.createdTillmm, this.state.createdTilldd]
                } : undefined),

            //third case: from date to beginning

            (!this.state.collapseCreated
            && this.state.collapseCreatedFrom
            && this.state.createdFromyyyy != ""
            && this.state.createdFrommm != ""
            && this.state.createdFromdd != ""
                ? {
                    column: "CreatedAt",
                    type: "GT",
                    value: [this.state.createdFromyyyy, this.state.createdFrommm, this.state.createdFromdd]
                } : undefined),


            //for: updatedAt
            //first case: one date
            (this.state.collapseUpdated
            && this.state.updatedyyyy != ""
            && this.state.updatedmm != ""
            && this.state.updateddd != ""
                ? {
                    column: "UpdatedAt",
                    type: "EQ",
                    value: [this.state.updatedyyyy, this.state.updatedmm, this.state.updateddd]
                } : undefined),


            //second case: from beginning to date

            (!this.state.collapseUpdated
            && this.state.collapseUpdatedTill
            && this.state.updatedTillyyyy != ""
            && this.state.updatedTillmm != ""
            && this.state.updatedTilldd != ""
                ? {
                    column: "UpdatedAt",
                    type: "LT",
                    value: [this.state.updatedTillyyyy, this.state.updatedTillmm, this.state.updatedTilldd]
                } : undefined),

            //third case: from date to beginning

            (!this.state.collapseUpdated
            && this.state.collapseUpdatedFrom
            && this.state.updatedFromyyyy != ""
            && this.state.updatedFrommm != ""
            && this.state.updatedFromdd != ""
                ? {
                    column: "UpdatedAt",
                    type: "GT",
                    value: [this.state.updatedFromyyyy, this.state.updatedFrommm, this.state.updatedFromdd]
                } : undefined),


            //TODO: closedAt

            (this.state.collapseClosed
            && this.state.closedyyyy != ""
            && this.state.closedmm != ""
            && this.state.closeddd != ""
                ? {
                    column: "ClosedAt",
                    type: "EQ",
                    value: [this.state.closedyyyy, this.state.closedmm, this.state.closeddd]
                } : undefined),


            //second case: from beginning to date

            (!this.state.collapseClosed
            && this.state.collapseClosedTill
            && this.state.closedTillyyyy != ""
            && this.state.closedTillmm != ""
            && this.state.closedTilldd != ""
                ? {
                    column: "ClosedAt",
                    type: "LT",
                    value: [this.state.closedTillyyyy, this.state.closedTillmm, this.state.closedTilldd]
                } : undefined),


            (!this.state.collapseClosed
            && this.state.collapseClosedFrom
            && this.state.closedFromyyyy != ""
            && this.state.closedFrommm != ""
            && this.state.closedFromdd != ""
                ? {
                    column: "ClosedAt",
                    type: "GT",
                    value: [this.state.closedFromyyyy, this.state.closedFrommm, this.state.closedFromdd]
                } : undefined),
        );

        for (var i = 0; i < this.state.arrayOfSelectedStates.length; i++) {
            arrayOfFilters.push({name: "StateId", type: "EQ", value: this.state.arrayOfSelectedStates[i]});
        }

        for (var i = 0; i < this.state.arrayOfSelectedScheds.length; i++) {
            arrayOfFilters.push({name: "SchedId", type: "EQ", value: this.state.arrayOfSelectedScheds[i]});
        }
//End of Old Filter

        var arrayOfNonNullFilters = arrayOfFilters.filter(function (x) {
            x !== null;
            return x;
        });



        var backendFilter = {};
        var arrayOfSelectedTypesId = [];

        for (var i = 0; i < this.state.arrayOfSelectedTypes.length; i++) {
            arrayOfSelectedTypesId.push(this.state.arrayOfSelectedTypes[i]['id']);
        }

        backendFilter["TypeId"] = arrayOfSelectedTypesId;

       /* for (var i = 0; i < this.state.arrayOfSelectedLocations.length; i++) {
            backendFilter["LocationId"] = this.state.arrayOfSelectedLocations[i];
        }*/
       backendFilter["LocationId"] = this.state.arrayOfSelectedLocations;


        backendFilter["ClassId"] = this.state.arrayOfSelectedClasses;



            //for: createdAt
            //first case: one date
            (this.state.collapseCreated
            && this.state.createdyyyy != ""
            && this.state.createdmm != ""
            && this.state.createddd != ""
                ? backendFilter["CreatedAt"] = this.state.createdyyyy + "-" + this.state.createdmm + "-" + this.state.createddd : undefined);


            //second case: from beginning to date

            (!this.state.collapseCreated
            && this.state.collapseCreatedTill
            && this.state.createdTillyyyy != ""
            && this.state.createdTillmm != ""
            && this.state.createdTilldd != ""
                ? backendFilter["CreatedTo"] = this.state.createdTillyyyy + "-" + this.state.createdTillmm + "-" + this.state.createdTilldd: undefined);

            //third case: from date to beginning

            (!this.state.collapseCreated
            && this.state.collapseCreatedFrom
            && this.state.createdFromyyyy != ""
            && this.state.createdFrommm != ""
            && this.state.createdFromdd != ""
                ?
                backendFilter["CreatedStart"] = this.state.createdFromyyyy + "-" + this.state.createdFrommm + "-" + this.state.createdFromdd : undefined);



            //for: updatedAt
            //first case: one date
            (this.state.collapseUpdated
            && this.state.updatedyyyy != ""
            && this.state.updatedmm != ""
            && this.state.updateddd != ""
                ?
                backendFilter["UpdatedAt"] = this.state.updatedyyyy + "-" + this.state.updatedmm + "-" + this.state.updateddd : undefined);


            //second case: from beginning to date

            (!this.state.collapseUpdated
            && this.state.collapseUpdatedTill
            && this.state.updatedTillyyyy != ""
            && this.state.updatedTillmm != ""
            && this.state.updatedTilldd != ""
                ? backendFilter["UpdatedTo"] = this.state.updatedTillyyyy + "-" + this.state.updatedTillmm + "-" + this.state.updatedTilldd : undefined);

            //third case: from date to beginning

            (!this.state.collapseUpdated
            && this.state.collapseUpdatedFrom
            && this.state.updatedFromyyyy != ""
            && this.state.updatedFrommm != ""
            && this.state.updatedFromdd != ""
                ? backendFilter["UpdatedStart"] = this.state.updatedFromyyyy + "-" +this.state.updatedFrommm + "-" + this.state.updatedFromdd : undefined);


            //TODO: closedAt

            (this.state.collapseClosed
            && this.state.closedyyyy != ""
            && this.state.closedmm != ""
            && this.state.closeddd != ""
                ? backendFilter["ClosedAt"] = this.state.closedyyyy + "-" + this.state.closedmm + "-" + this.state.closeddd : undefined);


            //second case: from beginning to date

            (!this.state.collapseClosed
            && this.state.collapseClosedTill
            && this.state.closedTillyyyy != ""
            && this.state.closedTillmm != ""
            && this.state.closedTilldd != ""
                ? backendFilter["ClosedTo"] = this.state.closedTillyyyy + "-" + this.state.closedTillmm + "-" + this.state.closedTilldd : undefined);


            (!this.state.collapseClosed
            && this.state.collapseClosedFrom
            && this.state.closedFromyyyy != ""
            && this.state.closedFrommm != ""
            && this.state.closedFromdd != ""
                ? backendFilter["ClosedStart"] = this.state.closedFromyyyy + "-" + this.state.closedFrommm + "-" + this.state.closedFromdd : undefined);

        /*for (var i = 0; i < this.state.arrayOfSelectedStates.length; i++) {
            backendFilter["StateId"] = this.state.arrayOfSelectedStates[i];
        }

        for (var i = 0; i < this.state.arrayOfSelectedScheds.length; i++) {
            backendFilter["SchedId"] = this.state.arrayOfSelectedScheds[i];
        }*/
        backendFilter["StateId"] = this.state.arrayOfSelectedStates;
        backendFilter["SchedId"] = this.state.arrayOfSelectedScheds;


        var result =
            [{
                fullTextSearch: this.state.fullTextSearch
            }, /*{filter: arrayOfNonNullFilters}*/
                backendFilter
            ];



        console.log('A bunch of record queries are submitted: ' + JSON.stringify(result));
        this.state.result = [];//CLEAR RESULTS for initialization

        //TODO: Vincent's call
        console.log('filters is:' + JSON.stringify(result[1]));
        this.sendHttpCall("POST", server + "/records/fulltext", {
            "keyword": result[0]['fullTextSearch'],
            "page": 1,
            "pageSize": 1000,
            "filters": result[1]
        }).then(function (response) {
            //filters = result[1]['filter'];
            //^but where is filters assigned? ^
            //console.log("response is:" + JSON.stringify(response));
            globalUpdate(response);
        });
        event.preventDefault();
    }

    handleSubmitRecordTypeSpecificSearch(event) {
        console.log('A bunch of record queries are submitted: ' +
            JSON.stringify(
                {
                    FilterBy:
                        {
                            projectFunction: this.state.projectFunction,
                            projectManager: this.state.projectManager,
                            projectClientName: this.state.projectClientName,
                            proposalFieldOfPractice: this.state.proposalFieldOfPractice,
                            proposalManager: this.state.proposalManager,
                            proposalClientName: this.state.proposalClientName
                        }
                }
            )
        );
        event.preventDefault();
    }

    handleChange(event) {
        const name = event.target.name;
        this.setState({
            [name]: event.target.value
        });
        //console.log(this.state);
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    toggleAttr() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    toggleCollapseCreated() {
        this.setState({
            collapseCreated: !this.state.collapseCreated,
            collapseCreatedFromTill: !this.state.collapseCreatedFromTill
        });
    }

    toggleCollapseCreatedFrom() {
        this.setState({collapseCreatedFrom: !this.state.collapseCreatedFrom});
    }

    toggleCollapseCreatedTill() {
        this.setState({collapseCreatedTill: !this.state.collapseCreatedTill});
    }

    toggleCollapseUpdated() {
        this.setState({
            collapseUpdated: !this.state.collapseUpdated,
            collapseUpdatedFromTill: !this.state.collapseUpdatedFromTill
        });
    }

    toggleCollapseUpdatedFrom() {
        this.setState({collapseUpdatedFrom: !this.state.collapseUpdatedFrom});
    }

    toggleCollapseUpdatedTill() {
        this.setState({collapseUpdatedTill: !this.state.collapseUpdatedTill});
    }

    //TODO: closedAt
    toggleCollapseClosed() {
        this.setState({
            collapseClosed: !this.state.collapseClosed,
            collapseClosedFromTill: !this.state.collapseClosedFromTill
        });
    }

    toggleCollapseClosedFrom() {
        this.setState({collapseClosedFrom: !this.state.collapseClosedFrom});
    }

    toggleCollapseClosedTill() {
        this.setState({collapseClosedTill: !this.state.collapseClosedTill});
    }

//For Quicksearch
    isCheckedQuickSearchAttr(e) {
        this.setState({
            quickSearchAttr: e.currentTarget.value
        });
    }

    toggleTypeDropdown() {
        this.setState({
            typeDropDownOpen: !this.state.typeDropDownOpen
        });
    }

    toggleTypeCheckbox(event) {
        var id = event.target.id;
        var name = event.target.name;

        //convert to a string and try

        console.log("arrayOfSelectedTypes:" + JSON.stringify(this.state.arrayOfSelectedTypes));
        console.log("{id:id,name:name}:" + JSON.stringify({id: id, name: name}));
        console.log("this.state.arrayOfSelectedTypes.includes({id:id,name:name}):" + this.state.arrayOfSelectedTypes.includes({
            id: id,
            name: name
        }));

        if (!JSON.stringify(this.state.arrayOfSelectedTypes).includes(JSON.stringify({id: id, name: name}))) {
            this.state.arrayOfSelectedTypes.push({id: id, name: name})
        }
        else {
            //var index = this.state.arrayOfSelectedTypes.indexOf({id: id, name: name});
            var index = this.state.arrayOfSelectedTypes.findIndex((i => i.id === id));
            if (index > -1) {
                this.state.arrayOfSelectedTypes.splice(index, 1);
            }
        }
    }

    displaySelectedTypeButtons() {
        var arrayOfSelectedTypeButtons = [];
        for (var i = 0; i < this.state.arrayOfSelectedTypes.length; i++) {
            arrayOfSelectedTypeButtons.push(
                <Button className="selected-types" color="primary">{this.state.arrayOfSelectedTypes[i]['name']}
                    X </Button>
            )
        }
        return arrayOfSelectedTypeButtons;
    }

    toggleLocationDropdown() {
        this.setState({
            locationDropDownOpen: !this.state.locationDropDownOpen
        });
    }

    toggleLocationCheckbox(event) {
        var id = event.target.id;

        if (!this.state.arrayOfSelectedLocations.includes(event.target.id)) {
            this.state.arrayOfSelectedLocations.push(event.target.id)
        }
        else {
            var index = this.state.arrayOfSelectedLocations.indexOf(event.target.id);
            if (index > -1) {
                this.state.arrayOfSelectedLocations.splice(index, 1);
            }
        }
    }

    toggleClassDropdown() {
        this.setState({
            classDropDownOpen: !this.state.classDropDownOpen
        });
    }

    toggleClassCheckbox(event) {
        var id = event.target.id;


        if (!this.state.arrayOfSelectedClasses.includes(event.target.id)) {
            this.state.arrayOfSelectedClasses.push(event.target.id)
        }
        else {
            var index = this.state.arrayOfSelectedClasses.indexOf(event.target.id);
            if (index > -1) {
                this.state.arrayOfSelectedClasses.splice(index, 1);
            }
        }
    }

    toggleStateDropdown() {
        this.setState({
            stateDropDownOpen: !this.state.stateDropDownOpen
        });
    }

    toggleStateCheckbox(event) {
        var id = event.target.id;


        if (!this.state.arrayOfSelectedStates.includes(event.target.id)) {
            this.state.arrayOfSelectedStates.push(event.target.id)
        }
        else {
            var index = this.state.arrayOfSelectedStates.indexOf(event.target.id);
            if (index > -1) {
                this.state.arrayOfSelectedStates.splice(index, 1);
            }
        }
    }

    toggleSchedDropdown() {
        this.setState({
            schedDropDownOpen: !this.state.schedDropDownOpen
        });
    }

    toggleSchedCheckbox(event) {
        var id = event.target.id;

        if (!this.state.arrayOfSelectedScheds.includes(event.target.id)) {
            this.state.arrayOfSelectedScheds.push(event.target.id)
        }
        else {
            var index = this.state.arrayOfSelectedScheds.indexOf(event.target.id);
            if (index > -1) {
                this.state.arrayOfSelectedScheds.splice(index, 1);
            }
        }
    }


    //TODO: Sample Location Param

    getLocationFromServerThenTransformToHtml() {
        var request = new XMLHttpRequest();
        request.open('GET', server + '/records/dropdownlocation', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log("LocationName from Server:");
                console.log(JSON.parse(request.response)["results"]);

                var listOfLocationDropDownItems = [];

                var serverLocationDropDownResults = JSON.parse(request.response)["results"];
                for (var i = 0; i < serverLocationDropDownResults.length; i++) {
                    listOfLocationDropDownItems.push(
                        <NavItem>
                            <Label check>
                                <Input type="checkbox" id={serverLocationDropDownResults[i]['LocationId']}
                                       name={serverLocationDropDownResults[i]['LocationName']}
                                       onClick={this.toggleLocationCheckbox}/>{' '}
                                {serverLocationDropDownResults[i]['LocationName']}
                            </Label>
                        </NavItem>
                    );
                }

                this.setState({
                    listOfLocationDropDownItemsStateForm: listOfLocationDropDownItems
                });
            } else {
                console.error('Response received and there was an error');
            }
        }.bind(this); //have to bind to the callback function so that it will callback properly
        request.onerror = function () {
            //TODO: display error to user
            console.error('Request error for locationDropDown');
        };
        request.send(); //don't forget to send the httprequest lmao
    }

    getClassFromServerThenTransformToHtml() {
        var request = new XMLHttpRequest();
        request.open('GET', server + '/records/dropdownclass', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log("ClassName from Server: ");
                console.log(JSON.parse(request.response)["results"]);

                var listOfClassDropDownItems = [];

                var serverClassDropDownResults = JSON.parse(request.response)["results"];
                for (var i = 0; i < serverClassDropDownResults.length; i++) {
                    listOfClassDropDownItems.push(
                        <NavItem>
                            <Label check>
                                <Input type="checkbox" id={serverClassDropDownResults[i]['classId']}
                                       name={serverClassDropDownResults[i]['className']}
                                       onClick={this.toggleClassCheckbox}/>{' '}
                                {serverClassDropDownResults[i]['className']}
                            </Label>
                        </NavItem>
                    );
                }

                this.setState({
                    listOfClassDropDownItemsStateForm: listOfClassDropDownItems
                });
            } else {
                console.error('Response received and there was an error');
            }
        }.bind(this); //have to bind to the callback function so that it will callback properly
        request.onerror = function () {
            //TODO: display error to user
            console.error('Request error for classDropDown');
        };
        request.send(); //don't forget to send the httprequest lmao
    }

    getTypeFromServerThenTransformToHtml() {
        var request = new XMLHttpRequest();
        request.open('GET', server + '/records/dropdowntype', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log("TypeName from Server: ");
                console.log(JSON.parse(request.response)["results"]);

                var listOfTypeDropDownItems = [];

                var serverTypeDropDownResults = JSON.parse(request.response)["results"];
                for (var i = 0; i < serverTypeDropDownResults.length; i++) {
                    listOfTypeDropDownItems.push(
                        <NavItem>
                            <Label check>
                                <Input type="checkbox" id={serverTypeDropDownResults[i]['typeId']}
                                       name={serverTypeDropDownResults[i]['typeName']}
                                       onClick={this.toggleTypeCheckbox}/>{' '}
                                {serverTypeDropDownResults[i]['typeName']}
                            </Label>
                        </NavItem>
                    );
                }

                this.setState({
                    listOfTypeDropDownItemsStateForm: listOfTypeDropDownItems
                });
            } else {
                console.error('Response received and there was an error');
            }
        }.bind(this); //have to bind to the callback function so that it will callback properly
        request.onerror = function () {
            //TODO: display error to user
            console.error('Request error for typeDropDown');
        };
        request.send(); //don't forget to send the httprequest lmao
    }

    getStateFromServerThenTransformToHtml() {
        var request = new XMLHttpRequest();
        request.open('GET', server + '/records/dropdownstate', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log("StateName from Server: ");
                console.log(JSON.parse(request.response)["results"]);

                var listOfStateDropDownItems = [];

                var serverStateDropDownResults = JSON.parse(request.response)["results"];
                for (var i = 0; i < serverStateDropDownResults.length; i++) {
                    listOfStateDropDownItems.push(
                        <NavItem>
                            <Label check>
                                <Input type="checkbox" id={serverStateDropDownResults[i]['stateId']}
                                       name={serverStateDropDownResults[i]['stateName']}
                                       onClick={this.toggleStateCheckbox}/>{' '}
                                {serverStateDropDownResults[i]['stateName']}
                            </Label>
                        </NavItem>
                    );
                }

                this.setState({
                    listOfStateDropDownItemsStateForm: listOfStateDropDownItems
                });
            } else {
                console.error('Response received and there was an error');
            }
        }.bind(this); //have to bind to the callback function so that it will callback properly
        request.onerror = function () {
            //TODO: display error to user
            console.error('Request error for stateDropDown');
        };
        request.send(); //don't forget to send the httprequest lmao
    }

    getSchedFromServerThenTransformToHtml() {
        var request = new XMLHttpRequest();
        request.open('GET', server + '/records/dropdownsched', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log("SchedName from Server: ");
                console.log(JSON.parse(request.response)["results"]);

                var listOfSchedDropDownItems = [];

                var serverSchedDropDownResults = JSON.parse(request.response)["results"];
                for (var i = 0; i < serverSchedDropDownResults.length; i++) {
                    listOfSchedDropDownItems.push(
                        <NavItem>
                            <Label check>
                                <Input type="checkbox" id={serverSchedDropDownResults[i]['schedId']}
                                       name={serverSchedDropDownResults[i]['schedName']}
                                       onClick={this.toggleSchedCheckbox}/>{' '}
                                {serverSchedDropDownResults[i]['schedName']}
                            </Label>
                        </NavItem>
                    );
                }

                this.setState({
                    listOfSchedDropDownItemsStateForm: listOfSchedDropDownItems
                });
            } else {
                console.error('Response received and there was an error');
            }
        }.bind(this); //have to bind to the callback function so that it will callback properly
        request.onerror = function () {
            //TODO: display error to user
            console.error('Request error for schedDropDown');
        };
        request.send(); //don't forget to send the httprequest lmao
    }


    render() {
        return (
            <div>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({active: this.state.activeTab === '1'})}
                            onClick={() => {
                                this.toggleTab('1');
                                globalUpdate({"results": []});
                            }}
                        >
                            Quick Search
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({active: this.state.activeTab === '2'})}
                            onClick={() => {
                                this.toggleTab('2');
                                globalUpdate({"results": []});
                            }}
                        >
                            Full Text Search
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({active: this.state.activeTab === '3'})}
                            onClick={() => {
                                this.toggleTab('3');
                                globalUpdate({"results": []});
                            }}
                        >
                            Record Type Specific Search
                        </NavLink>
                    </NavItem>


                    <NavItem>
                        <NavLink
                            className={classnames({active: this.state.activeTab === '4'})}
                            onClick={() => {
                                this.toggleTab('4');
                                this.populateConfigureTab();
                            }}
                        >
                            Configure Roles
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        <Row>
                            <Col sm="20">
                                <div className="animated fadeIn">
                                    <Form onSubmit={this.handleSubmitQuickSearch}>
                                        <FormGroup tag="fieldset">
                                            <legend>Please select quick search attribute:</legend>
                                            <FormGroup check>
                                                <Label check>
                                                    <Input type="radio" name="radio1" value="recordNum"
                                                           onChange={this.isCheckedQuickSearchAttr}
                                                           defaultChecked={true}/>{' '}
                                                    Record Number
                                                </Label>
                                            </FormGroup>
                                            <FormGroup check>
                                                <Label check>
                                                    <Input type="radio" name="radio1" value="consignmentCode"
                                                           onChange={this.isCheckedQuickSearchAttr}/>{' '}
                                                    Consignment Code
                                                </Label>
                                            </FormGroup>
                                            <FormGroup check>
                                                <Label check>
                                                    <Input type="radio" name="radio1" value="boxNum"
                                                           onChange={this.isCheckedQuickSearchAttr}/>{' '}
                                                    Box Number
                                                </Label>
                                            </FormGroup>
                                        </FormGroup>

                                        <FormGroup row>
                                            <Col sm={10}>
                                                <Input type="text" name="numberOrConsignmentCode"
                                                       value={this.state.numberOrConsignmentCode}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Search</Button>
                                            </Col>
                                        </FormGroup>
                                    </Form>

                                </div>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="2">
                        <Row>
                            <Col sm="20">
                                <div className="animated fadeIn">
                                    <Form onSubmit={this.handleSubmitFullTextSearch}>
                                        <FormGroup row>
                                            <Label for="fullTextSearch" sm={10}> Enter a valid Record/Box Number,
                                                Record/Box Title, Record/Box Notes or Box Consignment Id:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="fullTextSearch"
                                                       value={this.state.fullTextSearch} onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <h3>Filter By:</h3>
                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.typeDropDownOpen}
                                                              toggle={this.toggleTypeDropdown}>
                                                        <DropdownToggle caret>
                                                            Record Type (Click on the words of the ones you would like
                                                            to filter)
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <Nav>
                                                                    {this.state.listOfTypeDropDownItemsStateForm}
                                                                </Nav>
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </Col>
                                            </div>
                                            <div className="btn-toolbar">
                                                {this.displaySelectedTypeButtons()}
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.locationDropDownOpen}
                                                              toggle={this.toggleLocationDropdown}>
                                                        <DropdownToggle caret>
                                                            Location (Click on the words of the ones you would like to
                                                            filter)
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <Nav>
                                                                    {this.state.listOfLocationDropDownItemsStateForm}
                                                                </Nav>
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </Col>
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.classDropDownOpen}
                                                              toggle={this.toggleClassDropdown}>
                                                        <DropdownToggle caret>
                                                            Classification (Click on the words of the ones you would
                                                            like to filter)
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <Nav>
                                                                    {this.state.listOfClassDropDownItemsStateForm}
                                                                </Nav>
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </Col>
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <Label for="dateCreated" sm={2}>Date Created (yyyy/mm/dd): </Label>
                                            <Col sm={{size: 10}}>
                                                {' '}<Input type="checkbox" onClick={this.toggleCollapseCreated}/>{' '}
                                                Check this if you just want one specific date
                                            </Col>
                                        </FormGroup>

                                        <Collapse sm={20} isOpen={this.state.collapseCreated}>
                                            <FormGroup row>
                                                <Col sm={2}>
                                                    <Input type="text" name="createdyyyy" value={this.state.createdyyyy}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                                /
                                                <Col sm={2}>
                                                    <Input type="text" name="createdmm" value={this.state.createdmm}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                                /
                                                <Col sm={2}>
                                                    <Input type="text" name="createddd" value={this.state.createddd}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                            </FormGroup>
                                        </Collapse>

                                        <Collapse sm={20} isOpen={this.state.collapseCreatedFromTill}>
                                            <FormGroup row>
                                                <Label for="dateCreated" sm={2}>From{' '}</Label>
                                                <Col sm={{size: 10}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseCreatedFrom}/>{' '}
                                                    Beginning
                                                </Col>
                                            </FormGroup>

                                            <Collapse sm={20} isOpen={this.state.collapseCreatedFrom}>
                                                <FormGroup row>
                                                    <Col sm={2}>
                                                        <Input type="text" name="createdFromyyyy"
                                                               value={this.state.createdFromyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="createdFrommm"
                                                               value={this.state.createdFrommm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="createdFromdd"
                                                               value={this.state.createdFromdd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                </FormGroup>
                                            </Collapse>

                                            <FormGroup row>
                                                <Label for="dateCreated" sm={2}>Till</Label>
                                                <Col sm={{size: 10}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseCreatedTill}/>{' '}
                                                    Now
                                                </Col>
                                            </FormGroup>

                                            <Collapse sm={20} isOpen={this.state.collapseCreatedTill}>
                                                <FormGroup row>
                                                    <Col sm={2}>
                                                        <Input type="text" name="createdTillyyyy"
                                                               value={this.state.createdTillyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="createdTillmm"
                                                               value={this.state.createdTillmm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="createdTilldd"
                                                               value={this.state.createdTilldd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                </FormGroup>
                                            </Collapse>

                                        </Collapse>
                                        <FormGroup row>
                                            <Label for="dateCreated" sm={2}>Date Updated (yyyy/mm/dd): </Label>
                                            <Col sm={{size: 10}}>
                                                {' '}<Input type="checkbox" onClick={this.toggleCollapseUpdated}/>{' '}
                                                Check this if you just want one specific date
                                            </Col>
                                        </FormGroup>

                                        <Collapse sm={20} isOpen={this.state.collapseUpdated}>
                                            <FormGroup row>
                                                <Col sm={2}>
                                                    <Input type="text" name="updatedyyyy" value={this.state.updatedyyyy}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                                /
                                                <Col sm={2}>
                                                    <Input type="text" name="updatedmm" value={this.state.updatedmm}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                                /
                                                <Col sm={2}>
                                                    <Input type="text" name="updateddd" value={this.state.updateddd}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                            </FormGroup>
                                        </Collapse>

                                        <Collapse sm={20} isOpen={this.state.collapseUpdatedFromTill}>

                                            <FormGroup row>
                                                <Label for="dateCreated" sm={2}>From{' '}</Label>
                                                <Col sm={{size: 10}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseUpdatedFrom}/>{' '}
                                                    Beginning
                                                </Col>
                                            </FormGroup>

                                            <Collapse sm={20} isOpen={this.state.collapseUpdatedFrom}>
                                                <FormGroup row>
                                                    <Col sm={2}>
                                                        <Input type="text" name="updatedFromyyyy"
                                                               value={this.state.updatedFromyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="updatedFrommm"
                                                               value={this.state.updatedFrommm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="updatedFromdd"
                                                               value={this.state.updatedFromdd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                </FormGroup>
                                            </Collapse>

                                            <FormGroup row>
                                                <Label for="dateCreated" sm={2}>Till{' '}</Label>
                                                <Col sm={{size: 10}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseUpdatedTill}/>{' '}
                                                    Now
                                                </Col>
                                            </FormGroup>

                                            <Collapse sm={20} isOpen={this.state.collapseUpdatedTill}>
                                                <FormGroup row>
                                                    <Col sm={2}>
                                                        <Input type="text" name="updatedTillyyyy"
                                                               value={this.state.updatedTillyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="updatedTillmm"
                                                               value={this.state.updatedTillmm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="updatedTilldd"
                                                               value={this.state.updatedTillddd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                </FormGroup>
                                            </Collapse>
                                        </Collapse>

                                        <FormGroup row>
                                            <Label for="dateClosed" sm={2}>Date Closed (yyyy/mm/dd): </Label>
                                            <Col sm={{size: 10}}>
                                                {' '}<Input type="checkbox" onClick={this.toggleCollapseClosed}/>{' '}
                                                Check this if you just want one specific date
                                            </Col>
                                        </FormGroup>

                                        <Collapse sm={20} isOpen={this.state.collapseClosed}>
                                            <FormGroup row>
                                                <Col sm={2}>
                                                    <Input type="text" name="closedyyyy" value={this.state.closedyyyy}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                                /
                                                <Col sm={2}>
                                                    <Input type="text" name="closedmm" value={this.state.closedmm}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                                /
                                                <Col sm={2}>
                                                    <Input type="text" name="closeddd" value={this.state.closeddd}
                                                           onChange={this.handleChange}/>
                                                </Col>
                                            </FormGroup>
                                        </Collapse>

                                        <Collapse sm={20} isOpen={this.state.collapseClosedFromTill}>
                                            <FormGroup row>
                                                <Label for="dateClosed" sm={2}>From{' '}</Label>
                                                <Col sm={{size: 10}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseClosedFrom}/>{' '}
                                                    Beginning
                                                </Col>
                                            </FormGroup>

                                            <Collapse sm={20} isOpen={this.state.collapseClosedFrom}>
                                                <FormGroup row>
                                                    <Col sm={2}>
                                                        <Input type="text" name="closedFromyyyy"
                                                               value={this.state.closedFromyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="closedFrommm"
                                                               value={this.state.closedFrommm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="closedFromdd"
                                                               value={this.state.closedFromdd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                </FormGroup>
                                            </Collapse>

                                            <FormGroup row>
                                                <Label for="dateClosed" sm={2}>Till</Label>
                                                <Col sm={{size: 10}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseClosedTill}/>{' '}
                                                    Now
                                                </Col>
                                            </FormGroup>

                                            <Collapse sm={20} isOpen={this.state.collapseClosedTill}>
                                                <FormGroup row>
                                                    <Col sm={2}>
                                                        <Input type="text" name="closedTillyyyy"
                                                               value={this.state.closedTillyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="closedTillmm"
                                                               value={this.state.closedTillmm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col sm={2}>
                                                        <Input type="text" name="closedTilldd"
                                                               value={this.state.closedTilldd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                </FormGroup>
                                            </Collapse>

                                        </Collapse>


                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.stateDropDownOpen}
                                                              toggle={this.toggleStateDropdown}>
                                                        <DropdownToggle caret>
                                                            Record State (Click on the words of the ones you would like
                                                            to filter)
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <Nav>
                                                                    {this.state.listOfStateDropDownItemsStateForm}
                                                                </Nav>
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </Col>
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.schedDropDownOpen}
                                                              toggle={this.toggleSchedDropdown}>
                                                        <DropdownToggle caret>
                                                            Retention Schedule (Click on the words of the ones you would
                                                            like to filter)
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <Nav>
                                                                    {this.state.listOfSchedDropDownItemsStateForm}
                                                                </Nav>
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </Col>
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Search</Button>
                                            </Col>
                                        </FormGroup>
                                    </Form>

                                </div>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="3">
                        <Row>
                            <Col sm="20">
                                <div className="animated fadeIn">
                                    <Form onSubmit={this.handleSubmitRecordTypeSpecificSearch}>
                                        <h3>Project Filters:</h3>
                                        <FormGroup row>
                                            <Label for="projectFunction" sm={20}>Function:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="projectFunction"
                                                       value={this.state.projectFunction} onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="projectManager" sm={20}>Project Manager:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="projectManager"
                                                       value={this.state.projectManager} onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="projectClientName" sm={20}>Client Name:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="projectClientName"
                                                       value={this.state.projectClientName}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>

                                        <h3>Proposal Filters:</h3>
                                        <FormGroup row>
                                            <Label for="proposalFieldOfPractice" sm={20}>Field of Practice:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="proposalFieldOfPractice"
                                                       value={this.state.proposalFieldOfPractice}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="proposalManager" sm={20}>Proposal Manager:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="proposalManager"
                                                       value={this.state.proposalManager} onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="proposalClientName" sm={20}>Client Name:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="proposalClientName"
                                                       value={this.state.proposalClientName}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Search</Button>
                                            </Col>
                                        </FormGroup>


                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tabId="4">

                        <Row>
                            <Col sm="20">
                                <div className="animated fadeIn">
                                    <Form onSubmit={this.addRole}>

                                        <FormGroup row>
                                            <Label for="rolesName" sm={20}>Role Name:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="rolesName"
                                                       value={this.state.rolesName}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Add</Button>
                                            </Col>
                                        </FormGroup>
                                    </Form>

                                </div>
                            </Col>
                        </Row>
                    </TabPane>

                </TabContent>
            </div>
        );
    }
}

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    };

    componentWillMount() {
        dashGlobal.update = () => {
            // `this` refers to our react component
            this.setState({results: records});
        };
    }

    render() {
        return (
            <div>
                <div>
                    <SearchBar/>
                    <ResultsTable results={records}/>
                </div>
            </div>
        );
    }
}

/*TODO: add
<ResultsTable results={th} addToRecordLabels={this.props.addToRecordLabels} addToEndTabLabels={this.props.addToEndTabLabels} addToContainerReports={this.props.addToContainerReports} addToEnclosureReports={this.props.addToEnclosureReports}/>
between <SearchBar />
and </div>
later
*/

export default Dashboard;