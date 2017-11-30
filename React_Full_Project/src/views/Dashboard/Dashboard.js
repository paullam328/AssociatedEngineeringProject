import React, {Component} from "react";
import {
    Button,
    Row,
    Col,
    Collapse,
    Card,
    CardBlock,
    Form,
    FormGroup,
    Label,
    Input,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    TabContent, TabPane, Nav, NavItem, NavLink
} from "reactstrap";
import classnames from 'classnames';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import './Dashboard.css'
import {Switch, Route, Redirect} from 'react-router-dom';
import Page403 from '../Pages/Page403/'

import Full from '../../containers/Full/'


var responseJSON = {"results": []};
var records = [];
var dashGlobal = {};
var filters = [];

//var server = "http://13.59.251.84:8080";
var server = "http://localhost:8080";
var name;

var isAdministrator = false;
var isRecordsManagementClerk = false
var isRegularUser = false;

var data = [];
var dataWithId = [];
var selectedData = [];


function getDate(input) { //converts the JSON's string date into an array of ints, [year, month, day]
    return input.split("-", 3).map(function (x) {
        return parseInt(x);
    });
}

//given a valid JSON response, updates global variables and tables
function globalUpdate(response) {
    //responseJSON = response;
    //console.log("length before " + response.results.length);
    //records = filterJSON(response.results, filters);
    //console.log("responseJSON.results: " + response.results);
    records = response.results;
    //console.log("length after" + records.length);
    //console.log(records);
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
        this.state = {
            showPrintOptions: false
        };

        this.togglePrintOptions = this.togglePrintOptions.bind(this);
        this.printRecordLabel = this.printRecordLabel.bind(this);
        this.printEndTabLabel = this.printEndTabLabel.bind(this);
        this.printContainerReport = this.printContainerReport.bind(this);
    }


    printRecordLabel() {
        var arrayOfSelectedCompleteData = [];

        for (var i = 0; i < data.length; i++) {
            if (selectedData.includes(dataWithId[i]['RecordId'])) {
                arrayOfSelectedCompleteData.push(dataWithId[i]);
            }
        }
        this.togglePrintOptions();
        this.props.addToRecordLabels(arrayOfSelectedCompleteData);
        selectedData = [];
    }

    printEndTabLabel() {
        var arrayOfSelectedCompleteData = [];

        for (var i = 0; i < data.length; i++) {
            if (selectedData.includes(dataWithId[i]['RecordId'])) {
                arrayOfSelectedCompleteData.push(dataWithId[i]);
            }
        }
        this.togglePrintOptions();
        this.props.addToEndTabLabels(arrayOfSelectedCompleteData);
        selectedData = [];
    }

    printContainerReport() {
        var arrayOfSelectedCompleteData = [];

        for (var i = 0; i < data.length; i++) {
            if (selectedData.includes(dataWithId[i]['RecordId'])) {
                arrayOfSelectedCompleteData.push(dataWithId[i]);
            }
        }
        this.togglePrintOptions();
        this.props.addToContainerReports(arrayOfSelectedCompleteData);
        selectedData = [];
    }

    togglePrintOptions() {
        this.setState({
            showPrintOptions: !this.state.showPrintOptions
        });
    }


    render() {
        return (
            <tr>
                <th>Record Printing Options:
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
                            <DropdownItem>
                                <div onClick={this.printContainerReport}>+ Container Report</div>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </th>
            </tr>
        );
    }
    /*
     <th>{record.number}</th>
     <th>{record.consignmentCode}</th>
     <th>{record.title}</th>
     <th>{record.locationId}</th>
     */
}

//animated fadeIn
class ResultsTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = { selected: {}, selectAll: 0};

        this.toggleRow = this.toggleRow.bind(this);
    }

    toggleRow(RecordId) {
        const newSelected = Object.assign({}, this.state.selected);//assign selected
        newSelected[RecordId] = !this.state.selected[RecordId];
        this.setState({
            selected: newSelected,
            selectAll: 2
        });

        if (selectedData.includes(RecordId)) {
            selectedData.splice(selectedData.indexOf(RecordId), 1)
        } else {
            selectedData.push(RecordId);
        }
    }


    toggleSelectAll() {
        let newSelected = {};

        if (this.state.selectAll === 0) {
            data.forEach(x => {
                newSelected[x.RecordId] = true;
            });
        }

        this.setState({
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });

        selectedData.push(RecordId);
    }

    render() {

        data = this.props.results;
        dataWithId = data;
        for (var i = 0; i < dataWithId.length; i++) {
            var dataReinsert = dataWithId[i];
            dataWithId[i].id = i+1; //so row number starts from 1
        }

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


        let columns =
            (isRecordsManagementClerk || isAdministrator) ?
            [{
            id: "checkbox",
            accessor: "",
            Cell: ({ original }) => {
                //console.log("original is:");
                //console.log(original);
                return (
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={this.state.selected[original.RecordId] === true}
                        onChange={() => this.toggleRow(original.RecordId)}
                    />
                );
            },
            Header: x => {
                return (
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={this.state.selectAll === 1}
                        ref={input => {
                            //console.log("input is:");
                            //console.log(input);

                            if (input) {
                                input.indeterminate = this.state.selectAll === 2;
                            }
                        }}
                        onChange={() => this.toggleSelectAll()}
                    />
                );
            },
            sortable: false,
            width: 45
        }]: [];

        /*if (this.props.results.length > 0) {
            for (let key in this.props.results[0]) {
                if (this.props.results[0].hasOwnProperty(key) && !key.toLowerCase().endsWith("id")) {
                    columns.push({
                        "Header": key.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1"),
                        "accessor": key
                    });
                }
            }
        }*/



        if (dataWithId.length > 0) {
            for (let key in dataWithId[0]) {
                if (dataWithId[0].hasOwnProperty(key)) {
                    if (key == "id") {
                        columns.push({
                            "Header": "Row #",
                            "accessor": key
                        });
                    }
                }
            }
            for (let key in dataWithId[0]) {
                if (dataWithId[0].hasOwnProperty(key)) {
                    if (!key.toLowerCase().endsWith("id") && key != "id") {
                        columns.push({
                            "Header": key.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1"),
                            "accessor": key
                        });
                    }
                }

            }
        }

        let that = this;

        //that.props.results
        return (
            <div>
                {!isRegularUser ?
                    <RecordRow addToRecordLabels={this.props.addToRecordLabels}
                               addToEndTabLabels={this.props.addToEndTabLabels}
                               addToContainerReports={this.props.addToContainerReports}/> : null
                }
                <Row>
                    <Col>
                        <Card>
                            <CardBlock className="card-body">
                                <ReactTable
                                    data={data}
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

            dropdownValue: "Quick search attribute:",

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

            addRolesName: '',
            addRolesNameValidation: '',

            updateRolesId: '',
            updateRolesName: '',
            updateRolesIdValidation: '',
            updateRolesNameValidation: '',

            deleteRolesId: '',
            deleteRolesIdValidation: '',

            radioButtonValue: '',

            containerNumber: '',

            addLocationsName: '',
            addLocationsCode: '',

            updateLocationsId: '',
            updateLocationsName: '',
            updateLocationsCode: '',

            deleteLocationsId: '',

            recordTypeSpecificSearch: '',

            //isAdministration: this.props['isAdmin'],

            userType: {}

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

        this.populateConfigureTab = this.populateConfigureTab.bind(this);

        this.addRole = this.addRole.bind(this);
        this.updateRole = this.updateRole.bind(this);
        this.deleteRole = this.deleteRole.bind(this);

        this.addLocation = this.addLocation.bind(this);
        this.updateLocation = this.updateLocation.bind(this);
        this.deleteLocation = this.deleteLocation.bind(this);


        //this.isCheckedQuickSearchAttr = this.isCheckedQuickSearchAttr.bind(this); No more radio boxes

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
        this.displaySelectedLocationButtons = this.displaySelectedLocationButtons.bind(this);
        this.displaySelectedClassButtons = this.displaySelectedClassButtons.bind(this);
        this.displaySelectedStateButtons = this.displaySelectedStateButtons.bind(this);
        this.displaySelectedSchedButtons = this.displaySelectedSchedButtons.bind(this);

        //this.claimAuthorization = this.claimAuthorization.bind(this);

    }

    //fetch from server from the very beginning:

    componentWillMount() {
        this.getMappings();

	    //value = "/authorization"

	    /*
	     Hide everything and check before all these runs
	     If (get any result from (http://127.0.0.1:8080/users/authorization) = {"results":"Administrator"}) then authorized
	     If (empty/access-denied) then redirect to Page403.js

	     */
	    /*console.log("props in will mount");
        console.log(this.props);
        this.setState({
            isAdministration: this.props['isAdmin']
        }).bind();

        console.log("Dashboard:this.state.isAdmin:" + this.state.isAdministration);*/
    }

    sendHttpCall(method, url, json) {
        //console.log("in sendHttpCall()");
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

    /**
     * Populate the results table for the configure tabs:
     *      Configure roles
     *      Configure locations
     *      TODO: Configure users
     *
     * @param tabNum
     */
    populateConfigureTab(tabNum) {
        //console.log("in populateConfigureTab()");
        //console.log("tabNum: " + tabNum)

        let json = {};
        let method = "GET";
        let url;

        if (tabNum === '4') {

            url = "/roles/";

        } else if (tabNum === '5') {
            url = "/locations/";
        }

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
    }

    /**
     * --------------------------------
     * CRUD methods for Configure Roles.
     * --------------------------------
     */

    addRole(event) {
        //console.log("in addRole()");

        let json = {addRolesName: this.state.addRolesName};
        //console.log(JSON.stringify(json));
        let url = "/roles/";
        let method = "POST";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
        event.preventDefault();
    }

    updateRole(event) {
        //console.log("in updateRole()");
        let json = {updateRolesId: this.state.updateRolesId, updateRolesName: this.state.updateRolesName};
        let url = "/roles/";
        let method = "PUT";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });

        event.preventDefault();
    }

    deleteRole(event) {
        //console.log("in deleteRole()");
        let json = {deleteRolesId: this.state.deleteRolesId};
        //console.log(JSON.stringify(json));
        let url = "/roles/";
        let method = "DELETE";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);

        });
        event.preventDefault();
    }

    /**
     * --------------------------------
     * CRUD methods for Configure Locations.
     * --------------------------------
     */

    // TODO: add location doesn't work b/c locations.id doesn't auto increment
    addLocation(event) {
        //console.log("in addLocation()");

        let json = {addLocationsName: this.state.addLocationsName, addLocationsCode: this.state.addLocationsCode};
        console.log(JSON.stringify(json));
        let url = "/locations/";
        let method = "POST";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
        event.preventDefault();
    }

    updateLocation(event) {
        //console.log("in updateLocation()");
        let json = {
            updateLocationsId: this.state.updateLocationsId,
            updateLocationsName: this.state.updateLocationsName,
            updateLocationsCode: this.state.updateLocationsCode
        };

        console.log(JSON.stringify(json));
        let url = "/locations/";
        let method = "PUT";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
        event.preventDefault();
    }

    deleteLocation(event) {
        //console.log("in deleteLocation()");
        let json = {deleteLocationsId: this.state.deleteLocationsId};
        //console.log(JSON.stringify(json));
        let url = "/locations/";
        let method = "DELETE";

        this.sendHttpCall(method, server + url, json).then(function (result) {
            globalUpdate(result);
        });
        event.preventDefault();
    }

    handleSubmitQuickSearch(event) {

        let input = this.state.numberOrConsignmentCode.replace(" ", "");

        if (input.length < 5) {
            //console.log("Invalid input - input too short");
            // TODO: show invalid input warning on UI

        } else {
            /*let json = {};
            let url = "";
            if (this.state.quickSearchAttr == "recordNum") {
                console.log(JSON.stringify({Number: this.state.numberOrConsignmentCode}));
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
            */

            this.sendHttpCall("POST", server + "/records/quickSearch", {quickSearchInput: this.state.numberOrConsignmentCode}).then(function (result) {

                globalUpdate(result);
            });

        }
        event.preventDefault();
    }

    handleSubmitFullTextSearch(event) {
        var sampleFilterParam = {"CreatedStart": 'a', "UpdatedStart": "b", "TypeId": [5, 20, 25]};
        var backendFilter = {};

        var arrayOfSelectedTypesId = [];
        var arrayOfSelectedLocationsId = [];
        var arrayOfSelectedClassesId = [];
        var arrayOfSelectedStatesId = [];
        var arrayOfSelectedSchedsId = [];

        for (var i = 0; i < this.state.arrayOfSelectedTypes.length; i++) {
            arrayOfSelectedTypesId.push(this.state.arrayOfSelectedTypes[i]['id']);
        }

        backendFilter["TypeId"] = arrayOfSelectedTypesId;

        for (var i = 0; i < this.state.arrayOfSelectedLocations.length; i++) {
            arrayOfSelectedLocationsId.push(this.state.arrayOfSelectedLocations[i]['id']);
        }

        backendFilter["LocationId"] = arrayOfSelectedLocationsId;

        for (var i = 0; i < this.state.arrayOfSelectedClasses.length; i++) {
            arrayOfSelectedClassesId.push(this.state.arrayOfSelectedClasses[i]['id']);
        }

        backendFilter["ClassId"] = arrayOfSelectedClassesId;

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
            ? backendFilter["CreatedTo"] = this.state.createdTillyyyy + "-" + this.state.createdTillmm + "-" + this.state.createdTilldd : undefined);

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
            ? backendFilter["UpdatedStart"] = this.state.updatedFromyyyy + "-" + this.state.updatedFrommm + "-" + this.state.updatedFromdd : undefined);


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


        for (var i = 0; i < this.state.arrayOfSelectedStates.length; i++) {
            arrayOfSelectedStatesId.push(this.state.arrayOfSelectedStates[i]['id']);
        }
        backendFilter["StateId"] = arrayOfSelectedStatesId;


        for (var i = 0; i < this.state.arrayOfSelectedScheds.length; i++) {
            arrayOfSelectedSchedsId.push(this.state.arrayOfSelectedScheds[i]['id']);
        }

        backendFilter["SchedId"] = arrayOfSelectedSchedsId;


        var result = [{fullTextSearch: this.state.fullTextSearch}, backendFilter];


        console.log('A bunch of record queries are submitted: ' + JSON.stringify(result));
        this.state.result = [];//CLEAR RESULTS for initialization

        //TODO: Vincent's call
        //console.log('filters is:' + JSON.stringify(result[1]));
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
        /*console.log('A bunch of record queries are submitted: ' +
            JSON.stringify(
                [
                        {
                            projectSearchInput: this.state.recordTypeSpecificSearch,
                            filterByFunction: this.state.projectFunction,
                            filterByPM: this.state.projectManager,
                            filterbyClientName: this.state.projectClientName},
                    {
                        proposalSearchInput: this.state.recordTypeSpecificSearch,
                        filterByFieldOfPractice: this.state.proposalFieldOfPractice,
                        filterByPM: this.state.proposalManager,
                        filterbyClientName: this.state.proposalClientName}
                ]
            )
        );*/

        var projectJson = this.sendHttpCall("POST", server + "/records/projectSearch", {
            projectSearchInput: this.state.recordTypeSpecificSearch,
            filterByFunction: this.state.projectFunction,
            filterByPM: this.state.projectManager,
            filterbyClientName: this.state.projectClientName}).then(function (response) {
                console.log("project response:");
                console.log(response);
                return Promise.resolve(response);
        })
        .catch(function (error) {
                console.log("project error:");
                console.log(error);
         });

        var proposalJson = this.sendHttpCall("POST", server + "/records/proposalSearch", {
            proposalSearchInput: this.state.recordTypeSpecificSearch,
            filterByFieldOfPractice: this.state.proposalFieldOfPractice,
            filterByPM: this.state.proposalManager,
            filterbyClientName: this.state.proposalClientName}).then(function (response) {
                console.log("proposal response:");
                console.log(response);
                return Promise.resolve(response);
        }).catch(function (error) {
                console.log("proposal error:");
                console.log(error);
        });

        Promise.all([projectJson,proposalJson]).then(function (values) {

            var projectAndProposal = {};

            if (typeof values[0] !== "undefined" && typeof values[1] !== "undefined") {
                projectAndProposal.results = values[0]['results'].concat(values[1]['results']);
            } else if (typeof values[0] !== "undefined" && typeof values[1] === "undefined") {
                projectAndProposal.results = values[0]['results'];
            } else if (typeof values[0] === "undefined" && typeof values[1] !== "undefined") {
                projectAndProposal.results = values[1]['results'];
            } else {
                projectAndProposal = null;
                alert("No results are returned");
            }
            globalUpdate(projectAndProposal);

        }).catch(function (error) {
            console.log("projectAndProposal error:");
            console.log(error);
        });

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
    /*isCheckedQuickSearchAttr(e) {
        this.setState({
            quickSearchAttr: e.currentTarget.value
        });
    }
*/
    toggleTypeDropdown() {
        this.setState({
            typeDropDownOpen: !this.state.typeDropDownOpen
        });
    }

    toggleTypeCheckbox(event) {
        var id = event.target.id;
        var name = event.target.name;

        if (!JSON.stringify(this.state.arrayOfSelectedTypes).includes(JSON.stringify({id: id, name: name}))) {
            this.state.arrayOfSelectedTypes.push({id: id, name: name})
        }
        else {
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
                <Button className="selected-types" color="primary">{this.state.arrayOfSelectedTypes[i]['name']}</Button>
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
        var name = event.target.name;

        if (!JSON.stringify(this.state.arrayOfSelectedLocations).includes(JSON.stringify({id: id, name: name}))) {
            this.state.arrayOfSelectedLocations.push({id: id, name: name})
        }
        else {
            var index = this.state.arrayOfSelectedLocations.findIndex((i => i.id === id));
            if (index > -1) {
                this.state.arrayOfSelectedLocations.splice(index, 1);
            }
        }
    }
    displaySelectedLocationButtons() {
        var arrayOfSelectedLocationButtons = [];
        for (var i = 0; i < this.state.arrayOfSelectedLocations.length; i++) {
            arrayOfSelectedLocationButtons.push(
                <Button className="selected-locations" color="primary">{this.state.arrayOfSelectedLocations[i]['name']}</Button>
            )
        }
        return arrayOfSelectedLocationButtons;
    }

    toggleClassDropdown() {
        this.setState({
            classDropDownOpen: !this.state.classDropDownOpen
        });
    }

    toggleClassCheckbox(event) {
        var id = event.target.id;
        var name = event.target.name;

        if (!JSON.stringify(this.state.arrayOfSelectedClasses).includes(JSON.stringify({id: id, name: name}))) {
            this.state.arrayOfSelectedClasses.push({id: id, name: name})
        }
        else {
            var index = this.state.arrayOfSelectedClasses.findIndex((i => i.id === id));
            if (index > -1) {
                this.state.arrayOfSelectedClasses.splice(index, 1);
            }
        }
    }

    displaySelectedClassButtons() {
        var arrayOfSelectedClassButtons = [];
        for (var i = 0; i < this.state.arrayOfSelectedClasses.length; i++) {
            arrayOfSelectedClassButtons.push(
                <Button className="selected-classes" color="primary">{this.state.arrayOfSelectedClasses[i]['name']}</Button>
            )
        }
        return arrayOfSelectedClassButtons;
    }

    toggleStateDropdown() {
        this.setState({
            stateDropDownOpen: !this.state.stateDropDownOpen
        });
    }

    toggleStateCheckbox(event) {
        var id = event.target.id;
        var name = event.target.name;

        if (!JSON.stringify(this.state.arrayOfSelectedStates).includes(JSON.stringify({id: id, name: name}))) {
            this.state.arrayOfSelectedStates.push({id: id, name: name})
        }
        else {
            var index = this.state.arrayOfSelectedStates.findIndex((i => i.id === id));
            if (index > -1) {
                this.state.arrayOfSelectedStates.splice(index, 1);
            }
        }
    }

    displaySelectedStateButtons() {
        var arrayOfSelectedStateButtons = [];
        for (var i = 0; i < this.state.arrayOfSelectedStates.length; i++) {
            arrayOfSelectedStateButtons.push(
                <Button className="selected-states" color="primary">{this.state.arrayOfSelectedStates[i]['name']}</Button>
            )
        }
        return arrayOfSelectedStateButtons;
    }

    toggleSchedDropdown() {
        this.setState({
            schedDropDownOpen: !this.state.schedDropDownOpen
        });
    }

    toggleSchedCheckbox(event) {
        var id = event.target.id;
        var name = event.target.name;

        if (!JSON.stringify(this.state.arrayOfSelectedScheds).includes(JSON.stringify({id: id, name: name}))) {
            this.state.arrayOfSelectedScheds.push({id: id, name: name});
        }
        else {
            var index = this.state.arrayOfSelectedScheds.findIndex((i => i.id === id));
            if (index > -1) {
                this.state.arrayOfSelectedScheds.splice(index, 1);
            }
        }
    }

    displaySelectedSchedButtons() {
        var arrayOfSelectedScedButtons = [];
        for (var i = 0; i < this.state.arrayOfSelectedScheds.length; i++) {
            arrayOfSelectedScedButtons.push(
                <Button className="selected-scheds" color="primary">{this.state.arrayOfSelectedScheds[i]['name']}</Button>
            )
        }
        return arrayOfSelectedScedButtons;
    }

    //TODO: Sample Location Param
	getMappings()
	{
		this.sendHttpCall("GET", server + "/records/mappings", null).then(function(response){
			let listOfLocationDropDownItems = [];
			for(const loc of response["dropdownlocation"])
			{
				listOfLocationDropDownItems.push(
                    <NavItem>
                        <Label check>
                            <Input type="checkbox" id={loc['LocationId']}
                                   name={loc['LocationName']}
                                   onClick={this.toggleLocationCheckbox}/>{' '}
							{loc['LocationName']}
                        </Label>
                    </NavItem>
				);
			}

			let listOfClassDropDownItems = [];
			for(const cla of response["dropdownclass"])
            {
	            listOfClassDropDownItems.push(
                    <NavItem>
                        <Label check>
                            <Input type="checkbox" id={cla['classId']}
                                   name={cla['className']}
                                   onClick={this.toggleClassCheckbox}/>{' '}
				            {cla['className']}
                        </Label>
                    </NavItem>
	            );
            }

			let listOfTypeDropDownItems = [];
			for(const type of response["dropdowntype"])
            {
	            listOfTypeDropDownItems.push(
                    <NavItem>
                        <Label check>
                            <Input type="checkbox" id={type['typeId']}
                                   name={type['typeName']}
                                   onClick={this.toggleTypeCheckbox}/>{' '}
				            {type['typeName']}
                        </Label>
                    </NavItem>
	            );
            }

            let listOfStateDropDownItems = [];
			for(const state of response["dropdownstate"])
            {
	            listOfStateDropDownItems.push(
                    <NavItem>
                        <Label check>
                            <Input type="checkbox" id={state['stateId']}
                                   name={state['stateName']}
                                   onClick={this.toggleStateCheckbox}/>{' '}
				            {state['stateName']}
                        </Label>
                    </NavItem>
	            );
            }

            let listOfSchedDropDownItems = [];
			for(const sched of response["dropdownsched"])
            {
	            listOfSchedDropDownItems.push(
                    <NavItem>
                        <Label check>
                            <Input type="checkbox" id={sched['schedId']}
                                   name={sched['schedName']}
                                   onClick={this.toggleSchedCheckbox}/>{' '}
				            {sched['schedName']}
                        </Label>
                    </NavItem>
	            );
            }

			this.setState({
				listOfLocationDropDownItemsStateForm: listOfLocationDropDownItems,
				listOfClassDropDownItemsStateForm: listOfClassDropDownItems,
				listOfTypeDropDownItemsStateForm: listOfTypeDropDownItems,
				listOfStateDropDownItemsStateForm: listOfStateDropDownItems,
				listOfSchedDropDownItemsStateForm: listOfSchedDropDownItems
			});
		}.bind(this));
	}

    render() {
        // this.props.isAdmin here will return false, since it's returning too slowly, and that's why I set a global var instead
        // for the admin value
        //console.log('isAdministrator:' + isAdministrator); //TODO: This keeps printing out (runtime issue)
        return (
            <div className="search-bar">
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


                    {isAdministrator ?
                        [<NavItem>
                            <NavLink
                                className={classnames({active: this.state.activeTab === '4'})}
                                onClick={() => {
                                    this.toggleTab('4');
                                    this.populateConfigureTab('4');

                                }}
                            >
                                Configure Roles
                            </NavLink>
                        </NavItem>,

                        <NavItem>
                            <NavLink
                                className={classnames({active: this.state.activeTab === '5'})}
                                onClick={() => {
                                    this.toggleTab('5');
                                    this.populateConfigureTab('5');
                                }}
                            >
                                Configure Locations
                            </NavLink>
                        </NavItem>]
                        : null}



                </Nav>


                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        <Row>
                            <Col sm="20">
                                <div className="animated fadeIn">
                                    <Form onSubmit={this.handleSubmitQuickSearch}>
                                        <Label for="fullTextSearch" sm={10}> Enter a valid Record/Box Number,
                                            Record/Box Title, Record/Box Notes or Box Consignment Id:</Label>
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
                                                            Record Type
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
                                                            Location
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
                                            <div className="btn-toolbar">
                                                {this.displaySelectedLocationButtons()}
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.classDropDownOpen}
                                                              toggle={this.toggleClassDropdown}>
                                                        <DropdownToggle caret>
                                                            Classification
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
                                            <div className="btn-toolbar">
                                                {this.displaySelectedClassButtons()}
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <Label for="dateCreated" sm={3}>Date Created (yyyy/mm/dd): </Label>
                                            <Col sm={{size: 2}}>
                                                {' '}<Input type="checkbox" onClick={this.toggleCollapseCreated}/>{' '}
                                                Exact date
                                            </Col>
                                        </FormGroup>

                                        <Collapse isOpen={this.state.collapseCreated}>
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

                                        <Collapse isOpen={this.state.collapseCreatedFromTill}>
                                            <FormGroup className='rowControl' row>
                                                <Col className='boxControl' sm={{size: 2}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseCreatedFrom}/>{' '}
                                                    Beginning
                                                </Col>

                                            <Collapse isOpen={this.state.collapseCreatedFrom}>
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="createdFromyyyy"
                                                               value={this.state.createdFromyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="createdFrommm"
                                                               value={this.state.createdFrommm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="createdFromdd"
                                                               value={this.state.createdFromdd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                            </Collapse>

                                                <Label for="dateCreated" sm={1}>-</Label>
                                                <Col className='boxControl' sm={{size: 2}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseCreatedTill}/>{' '}
                                                    Now
                                                </Col>

                                            <Collapse isOpen={this.state.collapseCreatedTill}>
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="createdTillyyyy"
                                                               value={this.state.createdTillyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="createdTillmm"
                                                               value={this.state.createdTillmm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="createdTilldd"
                                                               value={this.state.createdTilldd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                            </Collapse>
                                            </FormGroup>

                                        </Collapse>
                                        <FormGroup row>
                                            <Label for="dateCreated" sm={3}>Date Updated (yyyy/mm/dd): </Label>
                                            <Col sm={{size: 2}}>
                                                {' '}<Input type="checkbox" onClick={this.toggleCollapseUpdated}/>{' '}
                                                Exact date
                                            </Col>
                                        </FormGroup>

                                        <Collapse isOpen={this.state.collapseUpdated}>
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

                                        <Collapse isOpen={this.state.collapseUpdatedFromTill}>

                                            <FormGroup className='rowControl' row>
                                                <Col className='boxControl' sm={{size: 2}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseUpdatedFrom}/>{' '}
                                                    Beginning
                                                </Col>

                                            <Collapse isOpen={this.state.collapseUpdatedFrom}>
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="updatedFromyyyy"
                                                               value={this.state.updatedFromyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="updatedFrommm"
                                                               value={this.state.updatedFrommm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="updatedFromdd"
                                                               value={this.state.updatedFromdd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                            </Collapse>

                                                <Label for="dateCreated" sm={1}>-</Label>
                                                <Col className='boxControl' sm={{size: 2}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseUpdatedTill}/>{' '}
                                                    Now
                                                </Col>

                                            <Collapse isOpen={this.state.collapseUpdatedTill}>
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="updatedTillyyyy"
                                                               value={this.state.updatedTillyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="updatedTillmm"
                                                               value={this.state.updatedTillmm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="updatedTilldd"
                                                               value={this.state.updatedTilldd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                            </Collapse>
                                            </FormGroup>
                                        </Collapse>

                                        <FormGroup row>
                                            <Label for="dateClosed" sm={3}>Date Closed (yyyy/mm/dd): </Label>
                                            <Col sm={{size: 2}}>
                                                {' '}<Input type="checkbox" onClick={this.toggleCollapseClosed}/>{' '}
                                                Exact date
                                            </Col>
                                        </FormGroup>

                                        <Collapse isOpen={this.state.collapseClosed}>
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

                                        <Collapse isOpen={this.state.collapseClosedFromTill}>
                                            <FormGroup className='rowControl' row>
                                                <Col className='boxControl' sm={{size: 2}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseClosedFrom}/>{' '}
                                                    Beginning
                                                </Col>

                                            <Collapse isOpen={this.state.collapseClosedFrom}>
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="closedFromyyyy"
                                                               value={this.state.closedFromyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="closedFrommm"
                                                               value={this.state.closedFrommm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="closedFromdd"
                                                               value={this.state.closedFromdd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                            </Collapse>

                                                <Label for="dateClosed" sm={1}>-</Label>
                                                <Col className='boxControl' sm={{size: 2}}>
                                                    {' '}<Input type="checkbox"
                                                                onClick={this.toggleCollapseClosedTill}/>{' '}
                                                    Now
                                                </Col>

                                            <Collapse isOpen={this.state.collapseClosedTill}>
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="closedTillyyyy"
                                                               value={this.state.closedTillyyyy}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="closedTillmm"
                                                               value={this.state.closedTillmm}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                                    /
                                                    <Col className='rowsControl' sm={3}>
                                                        <Input type="text" name="closedTilldd"
                                                               value={this.state.closedTilldd}
                                                               onChange={this.handleChange}/>
                                                    </Col>
                                            </Collapse>
                                            </FormGroup>
                                        </Collapse>


                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.stateDropDownOpen}
                                                              toggle={this.toggleStateDropdown}>
                                                        <DropdownToggle caret>
                                                            Record State
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
                                            <div className="btn-toolbar">
                                                {this.displaySelectedStateButtons()}
                                            </div>
                                        </FormGroup>

                                        <FormGroup row>
                                            <div>
                                                <Col sm={10}>
                                                    <Dropdown group isOpen={this.state.schedDropDownOpen}
                                                              toggle={this.toggleSchedDropdown}>
                                                        <DropdownToggle caret>
                                                            Retention Schedule
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
                                            <div className="btn-toolbar">
                                                {this.displaySelectedSchedButtons()}
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
                                        <FormGroup row>
                                            <Label for="recordTypeSpecificSearch" sm={10}> Enter a valid Record/Box Number,
                                                Record/Box Title, Record/Box Notes or Box Consignment Id:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="recordTypeSpecificSearch"
                                                       value={this.state.recordTypeSpecificSearch} onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
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

                                    <legend>Add New Role</legend>
                                    <Form onSubmit={this.addRole}>

                                        <FormGroup row>
                                            <Label for="addRolesName" sm={10}>Enter the new role name:</Label>
                                            <Col sm={10}>
                                                <Input type="text"
                                                       name="addRolesName"
                                                       value={this.state.addRolesName}
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

                                    <legend>Update Existing Role Name</legend>
                                    <Form onSubmit={this.updateRole}>
                                        <FormGroup row>
                                            <Label for="updateRolesId" sm={10}>Enter the role ID you would like to
                                                update:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="updateRolesId"
                                                       value={this.state.updateRolesId}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                            <Label for="updateRolesId" sm={10}>Enter the new role name:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="updateRolesName"
                                                       value={this.state.updateRolesName}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Update</Button>
                                            </Col>
                                        </FormGroup>
                                    </Form>

                                    <legend>Delete Role</legend>
                                    <Form onSubmit={this.deleteRole}>

                                        <FormGroup row>
                                            <Label for="deleteRolesId" sm={10}>Enter the role ID you would like to
                                                delete:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="deleteRolesId"
                                                       value={this.state.deleteRolesId}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Delete</Button>
                                            </Col>
                                        </FormGroup>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </TabPane>


                    <TabPane tabId="5">
                        <Row>
                            <Col sm="20">
                                <div className="animated fadeIn">
                                    <legend>Add New Location</legend>
                                    <Form onSubmit={this.addLocation}>

                                        <FormGroup row>
                                            <Label for="addLocationsName" sm={10}>Enter the new location name:</Label>
                                            <Col sm={10}>
                                                <Input type="text"
                                                       name="addLocationsName"
                                                       value={this.state.addLocationsName}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                            <Label for="addLocationsCode" sm={10}>Enter the new location code:</Label>
                                            <Col sm={10}>
                                                <Input type="text"
                                                       name="addLocationsCode"
                                                       value={this.state.addLocationsCode}
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

                                    <legend>Update Existing Location</legend>
                                    <Form onSubmit={this.updateLocation}>
                                        <FormGroup row>
                                            <Label for="updateLocationsId" sm={10}>Enter the location ID you would like
                                                to
                                                update:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="updateLocationsId"
                                                       value={this.state.updateLocationsId}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                            <Label for="updateLocationsName" sm={10}>Enter a new location name (or leave it blank):</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="updateLocationsName"
                                                       value={this.state.updateLocationsName}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                            <Label for="updateLocationsCode" sm={10}>Enter a new location code (or leave it blank):</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="updateLocationsCode"
                                                       value={this.state.updateLocationsCode}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Update</Button>
                                            </Col>
                                        </FormGroup>
                                    </Form>

                                    <legend>Delete Location</legend>
                                    <Form onSubmit={this.deleteLocation}>

                                        <FormGroup row>
                                            <Label for="deleteLocationsId" sm={10}>Enter the location ID you would like
                                                to
                                                delete:</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="deleteLocationsId"
                                                       value={this.state.deleteLocationsId}
                                                       onChange={this.handleChange}/>
                                            </Col>

                                        </FormGroup>
                                        <FormGroup row>
                                            <Col sm={{size: 10, offset: 2}}>
                                                <Button type="submit" id="submit-button" size="sm" color="secondary"
                                                        value="submit">Delete</Button>
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

    rowSelect(obj)
    {
        //console.log(JSON.stringify(obj));
    }

    render() {
        isAdministrator = this.props['isAdmin']; //setting it as a global variable is faster than setting a state, thus eliminating
        // the async bug
        isRecordsManagementClerk = this.props['isRMC'];
        isRegularUser = this.props['isRegular'];

        return (
            <div>
                <div>
                    <SearchBar/>
                    <ResultsTable  results={records}
                                   loadingText="Loading results..."
                                   noDataText="No results found"
                                   onClick={this.rowSelect.bind(this)}

                                   addToRecordLabels={this.props.addToRecordLabels}
                                   addToEndTabLabels={this.props.addToEndTabLabels}
                                   addToContainerReports={this.props.addToContainerReports}/>
                </div>
            </div>
        );
    }
}
/*
TODO: add
<ResultsTable results={th} addToRecordLabels={this.props.addToRecordLabels} addToEndTabLabels={this.props.addToEndTabLabels} addToContainerReports={this.props.addToContainerReports} addToEnclosureReports={this.props.addToEnclosureReports}/>
between <SearchBar />
and </div>
later
*/

export default Dashboard;