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

@Repository
public class ContainersDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UsersDao usersDao;

    public String ADMIN = "Administrator";
    public String RMC = "Records Management Clerk";
    public String REG_USER = "Regular User";
    public String DENIED = "Access Denied";


    public List<JSONObject> getRecordsinBox(String boxNumber) {
        String currentUserRole = usersDao.getAuthorization();

        if (!currentUserRole.equals(DENIED)) {
            final String sql =
                    "SELECT containers.Id AS ContainersID, " +
                            "containers.Number AS ContainersNumber, " +
                            "containers.Title AS ContainersTitle, " +
                            "containers.ConsignmentCode AS ContainersConsignmentCode, " +
                            "records.Number AS RecordsNumber, " +
                            "records.CreatedAt AS RecordsDateCreated, " +
                            "records.ClosedAt AS RecordsDateClosed, " +
                            "locations.Name AS RecordLocation, " +
                            "ClassificationView.ClassificationPath, " +
                            "retentionschedules.Years AS RetentionSchedYears " +
                            "FROM containers " +
                            "LEFT JOIN records ON containers.Id = records.ContainerId " +
                            "LEFT JOIN locations on records.LocationId = locations.Id " +
                            "LEFT JOIN recordclassifications ON recordclassifications.RecordId = records.Id " +
                            "LEFT JOIN ClassificationView on recordr.ClassificationView.recordid = records.Id " +
                            "LEFT JOIN retentionschedules ON retentionschedules.Id = records.ScheduleId " +
                            "WHERE containers.number = ?";

            List<JSONObject> queryList = jdbcTemplate.query(sql, new ResultSetExtractor<List<JSONObject>>() {

                @Override
                public List<JSONObject> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                    List<JSONObject> list = new ArrayList<JSONObject>();

                    while (resultSet.next()) {
                        JSONObject obj = new JSONObject();

                        obj.put("ContainersID", resultSet.getInt("ContainersID"));
                        obj.put("ContainersNumber", resultSet.getString("ContainersNumber"));
                        obj.put("ContainersConsignmentCode", resultSet.getString("ContainersConsignmentCode"));
                        obj.put("RecordsNumber", resultSet.getString("RecordsNumber"));
                        obj.put("RecordsDateClosed", resultSet.getString("RecordsDateClosed"));
                        obj.put("RecordLocation", resultSet.getString("RecordLocation"));
                        obj.put("ClassificationPath", resultSet.getString("ClassificationPath"));
                        obj.put("ContainersTitle", resultSet.getString("ContainersTitle"));
                        obj.put("RecordsDateCreated", resultSet.getString("RecordsDateCreated"));

                        // calculate destruction date
                        String createdDate = resultSet.getString("RecordsDateCreated");
                        int retentionYears = resultSet.getInt("RetentionSchedYears");
                        int createdYear = Integer.parseInt(createdDate.substring(0, 4));
                        int destroyYear = createdYear + retentionYears;
                        String destroyDate = Integer.toString(destroyYear) + createdDate.substring(4);
                        obj.put("RecordsDestructionDate", destroyDate);

                        list.add(obj);
                    }
                    System.out.println(list);
                    return list;
                }
            }, boxNumber);
            return queryList;

        } else {
            return null;
        }

    }


}
