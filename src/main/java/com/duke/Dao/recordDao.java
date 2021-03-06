package com.duke.Dao;

import com.duke.Entity.*;
import com.sun.org.apache.xerces.internal.xs.datatypes.ObjectList;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.support.incrementer.AbstractDataFieldMaxValueIncrementer;
import org.springframework.stereotype.Repository;


import javax.xml.stream.Location;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * recordDao class gets data from the MySQL database.
 */


@Repository
public class recordDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UsersDao usersDao;

    public String ADMIN = "Administrator";
    public String RMC = "Records Management Clerk";
    public String REG_USER = "Regular User";
    public String DENIED = "Access Denied";


    public List<record> getRecordById() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT Id,AttrId,RecordId,Value  FROM customattributevalues LIMIT 0,5";
            List<record> Record = jdbcTemplate.query(sql, new RowMapper<record>() {
                public record mapRow(ResultSet resultSet, int Id) throws SQLException {
                    record records = new record();
                    records.setId(resultSet.getInt("Id"));
                    records.setAttrId(resultSet.getInt("AttrId"));
                    records.setRecordId(resultSet.getInt("RecordId"));
                    records.setValue(resultSet.getString("Value"));
                    System.out.print(records);
                    return records;
                }
            });

            return Record;
        } else {
            return null;
        }
    }

    /**
     * This is a helper function that appends new object into an array object[]
     */
    private Object[] appendValue(Object[] obj, Object newObj) {

        ArrayList<Object> temp = new ArrayList<Object>(Arrays.asList(obj));
        temp.add(newObj);
        return temp.toArray();

    }

    public List<record> SearchRecordsByTitle(String title, String Number) {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            Object[] obj = new Object[]{};

            String likeExpression = "%" + title + "%";
            String numberExpression = "%" + Number + "%";
            obj = appendValue(obj, likeExpression);
            obj = appendValue(obj, numberExpression);

            final String sql = "SELECT * FROM records WHERE Title Like ? AND Number Like ?  LIMIT 0,5";
            List<record> Record = jdbcTemplate.query(sql, new RowMapper<record>() {
                public record mapRow(ResultSet resultSet, int Id) throws SQLException {
                    record records = new record();
                    records.setId(resultSet.getInt("Id"));
                    records.setNumber(resultSet.getString("Number"));
                    records.setTitle(resultSet.getString("Title"));
                    records.setScheduleId(resultSet.getInt("ScheduleId"));
                    records.setTypeId(resultSet.getInt("TypeId"));
                    records.setConsignmentCode(resultSet.getString("ConsignmentCode"));
                    records.setStateId(resultSet.getInt("StateId"));
                    records.setContainerId(resultSet.getInt("ContainerId"));
                    records.setLocationId(resultSet.getInt("LocationId"));
                    java.util.Date createdDate = resultSet.getDate("CreatedAt");
                    java.util.Date updatedDate = resultSet.getDate("UpdatedAt");
                    java.util.Date closedDate = resultSet.getDate("ClosedAt");
                    records.setCreatedAt(new java.sql.Timestamp(createdDate.getTime()));
                    records.setUpdatedAt(new java.sql.Timestamp(updatedDate.getTime()));
                    records.setClosedAt(new java.sql.Timestamp(closedDate.getTime()));
                    System.out.print(records);
                    return records;
                }
            }, obj);
            return Record;
        } else {
            return null;
        }
    }

    /**
     * Quick search by ConsignmentCode.
     * <p>
     * Returns all columns of records, location.Name (location_name),
     * notes.Text (notes), cutomattributevalues.Value (client_name),
     * and all columns of containers for the given consignment code.
     *
     * @param consignmentCode
     * @return
     */

    public List<record> SearchRecordsByConsignmentCode(String consignmentCode) {
        final String sql = "SELECT records.*, COALESCE(locations.Name, 'NA') AS location_name, COALESCE(notes.Text, 'NA') AS notes, COALESCE(customattributevalues.Value, 'NA') AS client_name, COALESCE(containers.Number, 'NA') AS containersNumber, COALESCE(containers.Id, -1) AS containersId, COALESCE(containers.Title, 'NA') AS containersTitle, containers.UpdatedAt AS containersUpdatedAt, containers.CreatedAt AS containersCreatedAt  FROM recordr.records INNER JOIN locations ON locations.Id = records.LocationId LEFT JOIN notes ON notes.RowId=records.Id AND notes.TableId = 26 LEFT JOIN customattributevalues ON customattributevalues.RecordId = records.Id AND customattributevalues.AttrId = 9 LEFT JOIN containers ON containers.Id = records.ContainerId WHERE records.ConsignmentCode = ? OR records.Number = ? OR containers.Number = ? ORDER BY records.ConsignmentCode ASC";

        final List<record> recordList = jdbcTemplate.query(sql, new ResultSetExtractor<List<record>>() {

            @Override
            public List<record> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                List<record> list = new ArrayList<record>();

                while (resultSet.next()) {

                    record l = new record();

                    //from records table
                    l.setId(resultSet.getInt("records.Id"));
                    l.setNumber(resultSet.getString("records.Number"));
                    l.setTitle(resultSet.getString("records.Title"));
                    l.setScheduleId(resultSet.getInt("records.ScheduleId"));
                    l.setTypeId(resultSet.getInt("records.TypeId"));
                    l.setConsignmentCode(resultSet.getString("records.ConsignmentCode"));
                    l.setStateId(resultSet.getInt("records.StateId"));
                    l.setContainerId(resultSet.getInt("records.ContainerId"));
                    l.setLocationId(resultSet.getInt("records.LocationId"));
                    java.util.Date createdDate = resultSet.getDate("records.CreatedAt");
                    java.util.Date updatedDate = resultSet.getDate("records.UpdatedAt");
                    java.util.Date closedDate = resultSet.getDate("records.ClosedAt");
                    l.setCreatedAt(new java.sql.Timestamp(createdDate.getTime()));
                    l.setUpdatedAt(new java.sql.Timestamp(updatedDate.getTime()));
                    l.setClosedAt(new java.sql.Timestamp(closedDate.getTime()));

                    l.setLocationName(resultSet.getString("location_name"));

                    l.setNotesText(resultSet.getString("notes"));

                    l.setClientName(resultSet.getString("client_name"));

                    // from containers table
                    l.setContainersId(resultSet.getInt("containersId"));
                    l.setContainersNumber(resultSet.getString("containersNumber"));
                    l.setContainersTitle(resultSet.getString("containersTitle"));
                    l.setContainersCreatedAt(resultSet.getTimestamp("containersCreatedAt"));
                    l.setContainersUpdatedAt(resultSet.getTimestamp("containersUpdatedAt"));

                    list.add(l);
                }

                System.out.println(list);
                return list;
            }
        }, consignmentCode);
        return recordList;
    }


    /**
     * Full text search on notes.
     * Joins records and notes, then selects those whose notes.text contains text
     * TODO: combine chunks
     * TODO: implement a rowmapper that is not ugly (potentially portable to other functions in this file)
     *
     * @param text - the text search
     * @return
     */
    public JSONObject SearchRecordsByNotes(String text) {

        return jdbcTemplate.query("select records.*, notes.Chunk, notes.Text from notes INNER JOIN records ON notes.RowId=records.Id where notes.TableId = 26 AND notes.Text LIKE " + text, new ResultSetExtractor<JSONObject>() {
            @Override
            public JSONObject extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                List<noteSearch> arr = new ArrayList<noteSearch>();
                int lastid = -1;
                int lastChunk = -2;
                int index = 0;
                while (resultSet.next()) {
                    if (resultSet.getInt("Id") == lastid && lastChunk + 1 == resultSet.getInt("Chunk")) {
                        //Additional pieces of the same note
                        noteSearch old = arr.get(index);
                        old.Text = old.Text.concat(resultSet.getString("Text"));
                        arr.set(index, old);
                        lastChunk++;
                        index++;
                        continue;
                    }
                    lastChunk = 0;
                    noteSearch note = new noteSearch();
                    note.Id = resultSet.getInt("Id");
                    lastid = note.Id;
                    note.Number = resultSet.getString("Number");
                    note.Title = resultSet.getString("Title");
                    note.ScheduleId = resultSet.getInt("ScheduleId");
                    note.TypeId = resultSet.getInt("TypeId");
                    note.ConsignmentCode = resultSet.getString("ConsignmentCode");
                    note.StateId = resultSet.getInt("StateId");
                    note.ContainerId = resultSet.getInt("ContainerId");
                    note.LocationId = resultSet.getInt("LocationId");
                    note.CreatedAt = resultSet.getDate("CreatedAt");
                    note.UpdatedAt = resultSet.getDate("UpdatedAt");
                    note.ClosedAt = resultSet.getDate("ClosedAt");
                    note.Text = resultSet.getString("Text");
                    arr.add(note);
                    index++;
                }
                JSONObject out = new JSONObject();
                out.put("results", arr);
                return out;
            }
        });
    }

    /**
     * Returns the location name of a record given record's Id.
     * <p>
     * Inner join on locations and records tables.
     *
     * @param RecordId Id from records table
     * @return
     */


    public List<Locations> GetRecordLocationForRecord(String RecordId) {
        final String sql = "SELECT locations.Name FROM locations INNER JOIN records on locations.Id = records.LocationId WHERE records.id = ?";

        final List<Locations> locationsList = jdbcTemplate.query(sql, new ResultSetExtractor<List<Locations>>() {

            @Override
            public List<Locations> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                List<Locations> list = new ArrayList<Locations>();

                while (resultSet.next()) {
                    Locations l = new Locations();
                    l.setName(resultSet.getString("locations.Name"));
                    list.add(l);
                }

                System.out.println(list);
                return list;
            }
        }, RecordId);
        return locationsList;
    }

    /**
     * Returns all columns from customattributevalues for customattributevalues == 7 and the given record ID.
     * <p>
     * Inner join on customattributevalues and records tables
     *
     * @param RecordId Id from records table
     * @return
     */

    public List<CustomAttributeValues> GetCustAttrValByRecordId(String RecordId) {
        //final String sql = "SELECT customattributevalues.*, notes.Text FROM customattributevalues INNER JOIN records ON customattributevalues.RecordId = records.Id INNER JOIN notes ON customattributevalues.RecordId = notes.RowId WHERE records.id = ? ";

        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {


            final String sql = "SELECT * FROM customattributevalues INNER JOIN records ON customattributevalues.RecordId = records.Id WHERE customattributevalues.AttrId = 7 AND records.id = ? ";
            final List<CustomAttributeValues> queryList = jdbcTemplate.query(sql, new ResultSetExtractor<List<CustomAttributeValues>>() {

                @Override
                public List<CustomAttributeValues> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                    List<CustomAttributeValues> list = new ArrayList<CustomAttributeValues>();


                    while (resultSet.next()) {
                        CustomAttributeValues obj = new CustomAttributeValues();

                        obj.setId(resultSet.getInt("customattributevalues.Id"));
                        obj.setAttrId(resultSet.getInt("customattributevalues.AttrId"));
                        obj.setRecordId(resultSet.getInt("customattributevalues.RecordId"));
                        obj.setValue(resultSet.getString("customattributevalues.Value"));

                        list.add(obj);
                    }
                    System.out.println(list);
                    return list;
                }
            }, RecordId);
            return queryList;
        } else {
            return null;
        }

    }

    /**
     * Returns recordclassifications.RecordId, classifications.Name and recordclassifications.Ordinal for the given record id.
     *
     * @param RecordId
     * @return
     */
    public List<Classifications> GetClassPath(String RecordId) {

        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT recordclassifications.RecordId, recordclassifications.Ordinal, classifications.Name FROM classifications  INNER JOIN recordclassifications ON classifications.Id = recordclassifications.ClassId  WHERE recordclassifications.RecordId = ? ORDER BY recordclassifications.Ordinal ASC";

            final List<Classifications> queryList = jdbcTemplate.query(sql, new ResultSetExtractor<List<Classifications>>() {

                @Override
                public List<Classifications> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                    List<Classifications> list = new ArrayList<Classifications>();

                    while (resultSet.next()) {
                        Classifications obj = new Classifications();

                        obj.setRecordId(resultSet.getInt("recordclassifications.RecordId"));
                        obj.setOrdinal(resultSet.getInt("recordclassifications.Ordinal"));
                        obj.setName(resultSet.getString("classifications.Name"));

                        list.add(obj);
                    }
                    System.out.println(list);
                    return list;
                }
            }, RecordId);
            return queryList;
        } else {
            return null;
        }
    }


    /**
     * Quick search by record number.
     * <p>
     * Returns all columns of records, location.Name (location_name),
     * notes.Text (notes), cutomattributevalues.Value (client_name),
     * and all columns of containers for the given record number.
     *
     * @param recordNumber - records.Number
     * @return
     */


    public List<record> SearchByRecordNumber(String recordNumber) {
        final String sql = "SELECT records.*, COALESCE(locations.Name, 'NA') AS location_name, COALESCE(notes.Text, 'NA') AS notes, COALESCE(customattributevalues.Value, 'NA') AS client_name, COALESCE(containers.Number, 'NA') AS containersNumber, COALESCE(containers.Id, -1) AS containersId, COALESCE(containers.Title, 'NA') AS containersTitle, containers.UpdatedAt AS containersUpdatedAt, containers.CreatedAt AS containersCreatedAt  FROM recordr.records INNER JOIN locations ON locations.Id = records.LocationId LEFT JOIN notes ON notes.RowId=records.Id AND notes.TableId = 26 LEFT JOIN customattributevalues ON customattributevalues.RecordId = records.Id AND customattributevalues.AttrId = 9 LEFT JOIN containers ON containers.Id = records.ContainerId WHERE records.ConsignmentCode = ? OR records.Number = ? OR containers.Number = ? ORDER BY records.Number ASC";

        final List<record> recordList = jdbcTemplate.query(sql, new ResultSetExtractor<List<record>>() {

            @Override
            public List<record> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                List<record> list = new ArrayList<record>();

                while (resultSet.next()) {
                    record l = new record();

                    //from records table
                    l.setId(resultSet.getInt("records.Id"));
                    l.setNumber(resultSet.getString("records.Number"));
                    l.setTitle(resultSet.getString("records.Title"));
                    l.setScheduleId(resultSet.getInt("records.ScheduleId"));
                    l.setTypeId(resultSet.getInt("records.TypeId"));
                    l.setConsignmentCode(resultSet.getString("records.ConsignmentCode"));
                    l.setStateId(resultSet.getInt("records.StateId"));
                    l.setContainerId(resultSet.getInt("records.ContainerId"));
                    l.setLocationId(resultSet.getInt("records.LocationId"));
                    java.util.Date createdDate = resultSet.getDate("records.CreatedAt");
                    java.util.Date updatedDate = resultSet.getDate("records.UpdatedAt");
                    java.util.Date closedDate = resultSet.getDate("records.ClosedAt");
                    l.setCreatedAt(new java.sql.Timestamp(createdDate.getTime()));
                    l.setUpdatedAt(new java.sql.Timestamp(updatedDate.getTime()));
                    l.setClosedAt(new java.sql.Timestamp(closedDate.getTime()));

                    l.setLocationName(resultSet.getString("location_name"));

                    l.setNotesText(resultSet.getString("notes"));

                    l.setClientName(resultSet.getString("client_name"));

                    // from containers table
                    l.setContainersId(resultSet.getInt("containersId"));
                    l.setContainersNumber(resultSet.getString("containersNumber"));
                    l.setContainersTitle(resultSet.getString("containersTitle"));
                    l.setContainersCreatedAt(resultSet.getTimestamp("containersCreatedAt"));
                    l.setContainersUpdatedAt(resultSet.getTimestamp("containersUpdatedAt"));

                    list.add(l);
                }

                System.out.println(list);
                return list;
            }
        }, recordNumber);
        return recordList;
    }


    /**
     * FullText Search for record by a keyword
     * <p>
     * Returns all matched records in FullText table
     *
     * @param keyword - keyword to search
     * @return
     */


    public List<JSONObject> FullTextSearch(String keyword, JSONObject filters, Integer page, Integer pageSize) {

        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            Object[] params = new Object[]{};
            keyword = "%" + keyword + "%";
            params = appendValue(params, keyword);
            params = appendValue(params, keyword);
            params = appendValue(params, keyword);
            params = appendValue(params, keyword);
            params = appendValue(params, keyword);
            params = appendValue(params, keyword);


            String classname;

            /*String sql = "SELECT * FROM FullTextTable WHERE (rNumber LIKE ? OR bNumber LIKE ? OR rTitle LIKE ? OR bTitle LIKE ? OR nTexts LIKE ? OR bcosign LIKE ?) "; */
            String sql =
                    "SELECT FullTextTable.*, " +
                            "coalesce(customattributevalues.Value, 'na') AS ClientName " +
                            "FROM FullTextTable " +
                            "LEFT JOIN customattributevalues on customattributevalues.RecordId = FullTextTable.rid AND customattributevalues.AttrId = 9 " +
                            "WHERE (rNumber LIKE ? OR bNumber LIKE ? OR rTitle LIKE ? OR bTitle LIKE ? OR nTexts LIKE ? OR bcosign LIKE ?) ";

            if (filters.has("CreatedStart")) {

                sql = sql + "AND rCreatedAt >= ? ";
                params = appendValue(params, filters.get("CreatedStart"));
            }
            if (filters.has("CreatedTo")) {
                sql = sql + "AND rCreatedAt <= ? ";
                params = appendValue(params, filters.get("CreatedTo"));
            }
            if (filters.has("CreatedAt")) {
                sql = sql + "AND rCreatedAt == ? ";
                params = appendValue(params, filters.get("CreatedAt"));
            }
            if (filters.has("UpdatedStart")) {
                sql = sql + "AND rUpdatedAt >= ? ";
                params = appendValue(params, filters.get("UpdatedStart"));
            }
            if (filters.has("UpdatedTo")) {
                sql = sql + "AND rUpdatedAt <= ? ";
                params = appendValue(params, filters.get("UpdatedTo"));
            }
            if (filters.has("UpdatedAt")) {
                sql = sql + "AND rUpdatedAt == ? ";
                params = appendValue(params, filters.get("UpdatedAt"));
            }
            if (filters.has("ClosedStart")) {
                sql = sql + "AND rClosedAt >= ? ";
                params = appendValue(params, filters.get("ClosedStart"));
            }
            if (filters.has("ClosedTo")) {
                sql = sql + "AND rClosedAt <= ? ";
                params = appendValue(params, filters.get("ClosedTo"));
            }
            if (filters.has("ClosedAt")) {
                sql = sql + "AND rClosedAt == ? ";
                params = appendValue(params, filters.get("ClosedAt"));
            }
            if (filters.has("LocationId")) {
                if (filters.getJSONArray("LocationId").length() > 0) {
                    sql = sql + "AND (lid=? ";
                    params = appendValue(params, filters.getJSONArray("LocationId").get(0));
                    if (filters.getJSONArray("LocationId").length() > 1) {
                        for (int i = 1; i < filters.getJSONArray("LocationId").length(); i++) {
                            sql = sql + " OR lid=? ";
                            params = appendValue(params, filters.getJSONArray("LocationId").get(i));
                        }
                    }
                    sql = sql + " ) ";
                }
            }
            if (filters.has("TypeId")) {
                if (filters.getJSONArray("TypeId").length() > 0) {
                    sql = sql + " AND (rtid=? ";
                    params = appendValue(params, filters.getJSONArray("TypeId").get(0));
                    if (filters.getJSONArray("TypeId").length() > 1) {
                        for (int i = 1; i < filters.getJSONArray("TypeId").length(); i++) {
                            sql = sql + " OR rtid=? ";
                            params = appendValue(params, filters.getJSONArray("TypeId").get(i));
                        }
                    }
                    sql = sql + " ) ";
                }
            }
            if (filters.has("ClassName")) {
                if (filters.getJSONArray("ClassName").length() > 0) {
                    classname = "%" + filters.getJSONArray("ClassName").get(0) + "%";
                    sql = sql + "AND (classList LIKE ? ";
                    params = appendValue(params, classname);
                    if (filters.getJSONArray("ClassName").length() > 1) {
                        for (int i = 1; i < filters.getJSONArray("ClassName").length(); i++) {
                            sql = sql + " OR classList LIKE ? ";
                            classname = "%" + filters.getJSONArray("ClassName").get(i) + "%";
                            params = appendValue(params, classname);
                        }
                    }
                    sql = sql + " ) ";
                }
            }
            if (filters.has("StateId")) {
                if (filters.getJSONArray("StateId").length() > 0) {
                    sql = sql + "AND (rsid=? ";
                    params = appendValue(params, filters.getJSONArray("StateId").get(0));
                    if (filters.getJSONArray("StateId").length() > 1) {
                        for (int i = 1; i < filters.getJSONArray("StateId").length(); i++) {
                            sql = sql + " OR rsid=? ";
                            params = appendValue(params, filters.getJSONArray("StateId").get(i));
                        }
                    }
                    sql = sql + " ) ";
                }
            }
            if (filters.has("SchedId")) {
                if (filters.getJSONArray("SchedId").length() > 0) {
                    sql = sql + "AND (rscid=?  ";
                    params = appendValue(params, filters.getJSONArray("SchedId").get(0));
                    if (filters.getJSONArray("SchedId").length() > 1) {
                        for (int i = 1; i < filters.getJSONArray("SchedId").length(); i++) {
                            sql = sql + " OR rscid=? ";
                            params = appendValue(params, filters.getJSONArray("SchedId").get(i));
                        }
                    }
                    sql = sql + " ) ";
                }
            }

            sql = sql + " LIMIT ?,?";
            Integer offset = pageSize * (page - 1);
            params = appendValue(params, offset);
            params = appendValue(params, pageSize);

            System.out.print(sql);
            System.out.print(params);

            final List<JSONObject> recordList = jdbcTemplate.query(sql, new ResultSetExtractor<List<JSONObject>>() {

                @Override
                public List<JSONObject> extractData(ResultSet resultSet) throws SQLException, DataAccessException {

                    List<JSONObject> list = new ArrayList<JSONObject>();

                    while (resultSet.next()) {
                        JSONObject FTresult = new JSONObject();
                        FTresult.put("RecordId", resultSet.getInt("rid"));
                        FTresult.put("RecordConsign", resultSet.getString("rconsign"));
                        FTresult.put("CreatedAt", resultSet.getDate("rCreatedAt"));
                        FTresult.put("ClosedAt", resultSet.getDate("rClosedAt"));
                        FTresult.put("RecordNumber", resultSet.getString("rNumber"));
                        FTresult.put("RecordTitle", resultSet.getString("rTitle"));
                        FTresult.put("UpdatedAt", resultSet.getDate("rUpdatedAt"));
                        FTresult.put("BoxId", resultSet.getInt("bid"));
                        FTresult.put("BoxConsign", resultSet.getString("bcosign"));
                        FTresult.put("BoxTitle", resultSet.getString("bTitle"));
                        FTresult.put("BoxNumber", resultSet.getString("bNumber"));
                        FTresult.put("NoteId", resultSet.getInt("nid"));
                        FTresult.put("Notes", resultSet.getString("nTexts"));
                        FTresult.put("LocationId", resultSet.getInt("lid"));
                        FTresult.put("LocationName", resultSet.getString("lName"));
                        FTresult.put("TypeId", resultSet.getInt("rtid"));
                        FTresult.put("TypeName", resultSet.getString("rtName"));
                        FTresult.put("Classifications", resultSet.getString("classList"));
                        FTresult.put("StateId", resultSet.getInt("rsid"));
                        FTresult.put("StateName", resultSet.getString("rsName"));
                        FTresult.put("ScheduleId", resultSet.getInt("rscid"));
                        FTresult.put("ScheduleName", resultSet.getString("rscName"));
                        FTresult.put("ClientName", resultSet.getString("ClientName"));

                        list.add(FTresult);
                    }

                    System.out.println(list);
                    return list;
                }
            }, params);
            return recordList;
        } else {
            return null;
        }
    }

    /**
     * FullText Search locations dropdown
     * <p>
     * Returns a list of locations {locationId,locationName} for the dropdown menu
     */

    public List<JSONObject> GetAllLocation() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT Id,Name FROM locations";
            List<JSONObject> AllLocations = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject Location = new JSONObject();
                    Location.put("LocationId", resultSet.getInt("Id"));
                    Location.put("LocationName", resultSet.getString("Name"));

                    return Location;
                }
            });
            return AllLocations;
        } else {
            return null;
        }
    }

    /**
     * FullText Search classifications dropdown
     * <p>
     * Returns a list of classifications {Id, Name} for the classifications dropdown menu
     */

    public List<JSONObject> GetAllclassifications() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT Id,Name FROM classifications";
            List<JSONObject> AllClassifications = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject classification = new JSONObject();
                    classification.put("classId", resultSet.getInt("Id"));
                    classification.put("className", resultSet.getString("Name"));

                    return classification;
                }
            });
            return AllClassifications;
        } else {
            return null;
        }
    }

    /**
     * FullText Search states dropdown
     * <p>
     * Returns a list of states {Id, Name} for the states dropdown menu
     */

    public List<JSONObject> GetAllstates() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT Id,Name FROM recordstates";
            List<JSONObject> Allstates = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject state = new JSONObject();
                    state.put("stateId", resultSet.getInt("Id"));
                    state.put("stateName", resultSet.getString("Name"));

                    return state;
                }
            });
            return Allstates;
        } else {
            return null;
        }
    }

    /**
     * FullText Search record types dropdown
     * <p>
     * Returns a list of types {Id, Name} for the types dropdown menu
     */

    public List<JSONObject> GetAllTypes() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT Id,Name FROM recordtypes";
            List<JSONObject> Alltypes = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject type = new JSONObject();
                    type.put("typeId", resultSet.getInt("Id"));
                    type.put("typeName", resultSet.getString("Name"));

                    return type;
                }
            });
            return Alltypes;
        } else {
            return null;
        }
    }

    /**
     * FullText Search retension schedule dropdown
     */

    public List<JSONObject> GetAllschedules() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT Id,Name FROM retentionschedules";
            List<JSONObject> Allschedules = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject sched = new JSONObject();
                    sched.put("schedId", resultSet.getInt("Id"));
                    sched.put("schedName", resultSet.getString("Name"));

                    return sched;
                }
            });
            return Allschedules;
        } else {
            return null;
        }
    }

    /**
     * Retrieve End tab label colours
     */

    public List<JSONObject> GetAllColours() {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            final String sql = "SELECT * FROM labelcolours";
            List<JSONObject> allColours = jdbcTemplate.query(sql, new RowMapper<JSONObject>() {
                public JSONObject mapRow(ResultSet resultSet, int Id) throws SQLException {
                    JSONObject colour = new JSONObject();
                    colour.put("key", resultSet.getString("key"));
                    colour.put("colour", resultSet.getString("colour"));

                    return colour;
                }
            });
            return allColours;
        } else {
            return null;
        }
    }

    /**
     * Quick search
     * <p>
     * Returns all columns of records, location.Name (location_name),
     * notes.Text (notes), cutomattributevalues.Value (client_name),
     * and all columns of containers for the given records number, records
     * consignment code, or containers number.
     *
     * @param quickSearchInput
     * @return
     */
    public List<record> searchByQuickSearch(String quickSearchInput) {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            System.out.println("in searchByQuickSearch");
            final String sql =
                    "SELECT records.*, " +
                            "COALESCE(locations.Name, 'NA') AS location_name, " +
                            "COALESCE(notes.Text, 'NA') AS notes, " +
                            "COALESCE(customattributevalues.Value, 'NA') AS client_name, " +
                            "COALESCE(containers.Number, 'NA') AS containersNumber, " +
                            "COALESCE(containers.Id, -1) AS containersId, " +
                            "COALESCE(containers.Title, 'NA') AS containersTitle, " +
                            "containers.UpdatedAt AS containersUpdatedAt, " +
                            "containers.CreatedAt AS containersCreatedAt " +
                            "FROM recordr.records " +
                            "LEFT JOIN locations ON locations.Id = records.LocationId " +
                            "LEFT JOIN notes ON notes.RowId=records.Id AND notes.TableId = 26 " +
                            "LEFT JOIN customattributevalues ON customattributevalues.RecordId = records.Id AND customattributevalues.AttrId = 9 " +
                            "LEFT JOIN containers ON containers.Id = records.ContainerId " +
                            "WHERE records.ConsignmentCode = ? OR records.Number = ? OR containers.Number = ?";

            final List<record> recordList = jdbcTemplate.query(sql, new ResultSetExtractor<List<record>>() {

                @Override
                public List<record> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                    List<record> list = new ArrayList<record>();

                    while (resultSet.next()) {
                        record l = new record();

                        //from records table
                        l.setId(resultSet.getInt("records.Id"));
                        l.setNumber(resultSet.getString("records.Number"));
                        l.setTitle(resultSet.getString("records.Title"));
                        l.setScheduleId(resultSet.getInt("records.ScheduleId"));
                        l.setTypeId(resultSet.getInt("records.TypeId"));
                        l.setConsignmentCode(resultSet.getString("records.ConsignmentCode"));
                        l.setStateId(resultSet.getInt("records.StateId"));
                        l.setContainerId(resultSet.getInt("records.ContainerId"));
                        l.setLocationId(resultSet.getInt("records.LocationId"));
                        java.util.Date createdDate = resultSet.getDate("records.CreatedAt");
                        java.util.Date updatedDate = resultSet.getDate("records.UpdatedAt");
                        java.util.Date closedDate = resultSet.getDate("records.ClosedAt");
                        l.setCreatedAt(new java.sql.Timestamp(createdDate.getTime()));
                        l.setUpdatedAt(new java.sql.Timestamp(updatedDate.getTime()));
                        l.setClosedAt(new java.sql.Timestamp(closedDate.getTime()));

                        l.setLocationName(resultSet.getString("location_name"));

                        l.setNotesText(resultSet.getString("notes"));

                        l.setClientName(resultSet.getString("client_name"));

                        // from containers table
                        l.setContainersId(resultSet.getInt("containersId"));
                        l.setContainersNumber(resultSet.getString("containersNumber"));
                        l.setContainersTitle(resultSet.getString("containersTitle"));
                        l.setContainersCreatedAt(resultSet.getTimestamp("containersCreatedAt"));
                        l.setContainersUpdatedAt(resultSet.getTimestamp("containersUpdatedAt"));

                        list.add(l);
                    }

                    System.out.println(list);
                    return list;
                }
            }, quickSearchInput, quickSearchInput, quickSearchInput);
            return recordList;
        } else {
            return null;
        }
    }


    /**
     * Record specific type search for projects.
     *
     * @param projectSearchInput - record number, box number, record title, box title, notes, or consignment code to be searched
     * @param filterByFunction
     * @param filterByPM
     * @param filterByClientName
     * @return
     */

    public List<record> searchByProject(String projectSearchInput, String filterByFunction, String filterByPM, String filterByClientName) {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            System.out.println("in RecordDao... searchByProject()");

            Object[] params = new Object[]{};
            final List<record> recordList;

            projectSearchInput = "%" + projectSearchInput + "%";

            filterByFunction = filterByFunction.trim();
            filterByPM = filterByPM.trim();
            filterByClientName = filterByClientName.trim();

            int functionFilterLength = filterByFunction.length();
            int PMFilterLength = filterByPM.length();
            int CNFilterLength = filterByClientName.length();


            String sql =
                    "SELECT 'Project' AS RecordType, " +
                            "records.Number AS RecordsNumber, " +
                            "records.Title AS RecordsTitle, " +
                            "records.ConsignmentCode AS ConsignmentCode, " +
                            "containers.Number AS ContainerNumber, " +
                            "containers.Title AS ContainerTitle, " +
                            "locations.Name AS LocationName, " +
                            "coalesce('NA', notes.Text) AS NotesText, " +
                            "customattributevalues.Value AS CustomerAttributeValue, " +
                            "customattributes.Name AS CustomerAttribute, " +
                            "classifications.Name AS Function " +
                            "FROM records " +
                            "LEFT JOIN locations ON locations.Id = records.LocationId " +
                            "LEFT JOIN notes ON notes.RowId=records.Id AND notes.TableId = 26 " +
                            "LEFT JOIN customattributevalues ON customattributevalues.RecordId = records.Id " +
                            "LEFT JOIN customattributes ON customattributevalues.AttrId = customattributes.Id " +
                            "LEFT JOIN containers ON containers.Id = records.ContainerId " +
                            "LEFT JOIN recordclassifications ON recordclassifications.RecordId = records.id " +
                            "LEFT JOIN classifications ON classifications.Id = recordclassifications.ClassId " +
                            "INNER JOIN recordtypes ON recordtypes.Id = records.TypeId AND recordtypes.Id = 83 " +
                            "WHERE " +
                            "(records.ConsignmentCode LIKE ? " +
                            "OR records.Number LIKE ? " +
                            "OR containers.Number LIKE ? " +
                            "OR records.Title LIKE ? " +
                            "OR notes.Text LIKE ? " +
                            "OR containers.Title LIKE ?) ";



            for (int i = 0; i < 6; i++) {
                params = appendValue(params, projectSearchInput);
            }

            if (functionFilterLength > 1) {
                filterByFunction = "%" + filterByFunction + "%";
                sql = sql + "AND classifications.Name LIKE ? AND classifications.keyword = 'T' ";
                params = appendValue(params, filterByFunction);
            }

            if (PMFilterLength > 1) {
                sql = sql + "AND customattributevalues.Value LIKE ? AND customattributes.Id = 6 ";
                filterByPM = "%" + filterByPM + "%";
                params = appendValue(params, filterByPM);
            }

            if (CNFilterLength > 1) {
                sql = sql + "AND customattributevalues.Value LIKE ? AND customattributes.Id = 9 ";
                filterByClientName = "%" + filterByClientName + "%";
                params = appendValue(params, filterByClientName);
            }

            System.out.println(sql);
            System.out.println(params.toString());

            recordList = jdbcTemplate.query(sql, new ResultSetExtractor<List<record>>() {

                @Override
                public List<record> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                    List<record> list = new ArrayList<record>();

                    while (resultSet.next()) {
                        record l = new record();
                        l.setRecordType("Project");
                        l.setNumber(resultSet.getString("RecordsNumber"));
                        l.setTitle(resultSet.getString("RecordsTitle"));
                        l.setConsignmentCode(resultSet.getString("ConsignmentCode"));
                        l.setContainersNumber(resultSet.getString("ContainerNumber"));
                        l.setContainersTitle(resultSet.getString("ContainerTitle"));
                        l.setLocationName(resultSet.getString("LocationName"));
                        l.setNotesText(resultSet.getString("NotesText"));
                        l.setCustomerName(resultSet.getString("CustomerAttributeValue"));
                        l.setCustomerType(resultSet.getString("CustomerAttribute"));
                        l.setFunction(resultSet.getString("Function"));

                        list.add(l);
                    }

                    System.out.println(list);
                    return list;
                }
            }, params);
            return recordList;
        } else {
            return null;
        }
    }

    /**
     * Record specific type search for proposals.
     *
     *
     * @param proposalSearchInput - record number, box number, record title, box title, notes, or consignment code to be searched
     * @param filterByFOP
     * @param filterByPM
     * @param filterByClientName
     * @return
     */

    public List<record> searchByProposal(String proposalSearchInput, String filterByFOP, String filterByPM, String filterByClientName) {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {

            System.out.println("in RecordDao... searchByProposal()");

            Object[] params = new Object[]{};
            final List<record> recordList;

            proposalSearchInput = "%" + proposalSearchInput + "%";

            filterByFOP = filterByFOP.trim();
            filterByPM = filterByPM.trim();
            filterByClientName = filterByClientName.trim();

            int FOPFilterLength = filterByFOP.length();
            int PMFilterLength = filterByPM.length();
            int CNFilterLength = filterByClientName.length();

            String sql =
                    "SELECT 'Proposal' AS RecordType, " +
                            "records.Number AS RecordsNumber, " +
                            "records.Title AS RecordsTitle, " +
                            "records.ConsignmentCode AS ConsignmentCode, " +
                            "containers.Number AS ContainerNumber, " +
                            "containers.Title AS ContainerTitle, " +
                            "locations.Name AS LocationName, " +
                            "coalesce('NA', notes.Text) AS NotesText, " +
                            "customattributevalues.Value AS CustomerAttributeValue, " +
                            "customattributes.Name AS CustomerAttribute " +
                            "FROM records " +
                            "LEFT JOIN locations ON locations.Id = records.LocationId " +
                            "LEFT JOIN notes ON notes.RowId=records.Id AND notes.TableId = 26 " +
                            "LEFT JOIN customattributevalues ON customattributevalues.RecordId = records.Id " +
                            "LEFT JOIN customattributes ON customattributevalues.AttrId = customattributes.Id " +
                            "LEFT JOIN containers ON containers.Id = records.ContainerId " +
                            "INNER JOIN recordtypes ON recordtypes.Id = records.TypeId and recordtypes.Id = 32 " +
                            "WHERE " +
                            "(records.ConsignmentCode LIKE ? " +
                            "OR records.Number LIKE ? " +
                            "OR containers.Number LIKE ? " +
                            "OR records.Title LIKE ? " +
                            "OR notes.Text LIKE ? " +
                            "OR containers.Title LIKE ?) ";

            for (int i = 0; i < 6; i++) {
                params = appendValue(params, proposalSearchInput);
            }

            if (FOPFilterLength > 1) {
                sql = sql + "AND customattributevalues.Value LIKE ? AND customattributes.Id = 4 ";
                filterByFOP = "%" + filterByFOP + "%";
                params = appendValue(params, filterByFOP);
            }

            if (PMFilterLength > 1) {
                sql = sql + "AND customattributevalues.Value LIKE ? AND customattributes.Id = 7 ";
                filterByPM = "%" + filterByPM + "%";
                params = appendValue(params, filterByPM);
            }

            if (CNFilterLength > 1) {
                sql = sql + "AND customattributevalues.Value LIKE ? AND customattributes.Id = 9 ";
                filterByClientName = "%" + filterByClientName + "%";
                params = appendValue(params, filterByClientName);
            }

            System.out.println(sql);
            System.out.println(params.toString());

            recordList = jdbcTemplate.query(sql, new ResultSetExtractor<List<record>>() {

                @Override
                public List<record> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                    List<record> list = new ArrayList<record>();

                    while (resultSet.next()) {
                        record l = new record();
                        l.setRecordType("Proposal");
                        l.setNumber(resultSet.getString("RecordsNumber"));
                        l.setTitle(resultSet.getString("RecordsTitle"));
                        l.setConsignmentCode(resultSet.getString("ConsignmentCode"));
                        l.setContainersNumber(resultSet.getString("ContainerNumber"));
                        l.setContainersTitle(resultSet.getString("ContainerTitle"));
                        l.setLocationName(resultSet.getString("LocationName"));
                        l.setNotesText(resultSet.getString("NotesText"));
                        l.setCustomerName(resultSet.getString("CustomerAttributeValue"));
                        l.setCustomerType(resultSet.getString("CustomerAttribute"));

                        list.add(l);
                    }

                    System.out.println(list);
                    return list;
                }
            }, params);
            return recordList;
        } else {
            return null;
        }
    }
}

