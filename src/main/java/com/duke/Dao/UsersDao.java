package com.duke.Dao;

import com.duke.Entity.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;


import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;


import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Repository
public class UsersDao extends HttpServlet{

    @Autowired
    private JdbcTemplate jdbcTemplate;
    public String ADMIN = "Administrator";
    public String RMC = "Records Management Clerk";
    public String REG_USER = "Regular User";
    public String DENIED = "Access Denied";

    /**
     * For user authorization.
     *
     * Returns the userid for the currently logged in user.
     * If no userid is found, return null.
     *
     * NOTE:
     * Using HttpRequestServlet.getRemoteUser() per discussion w/ Julin.
     * Can't test this without logging into AE, so she says it's OK
     * not to test it.
     *
     * Hardcoded userid to 'lange' for testing.
     * lange is an admin.

     */
    public String getCurrentRemoteUser() {
        System.out.println("in getCurrentRemoteUser()");
        // TODO: Use HttpServlet to get remote user. Uncomment first line below for project handin.
        // String username = request.getRemoteUser();

        // access denied name:
        //String name = "ae\\goulet";

        // admin name:
        //String name = "ae\\lange";

        // RMC name:
        String name = "ae\\reichertb";

        int startIndex = name.indexOf("\\") + 1;

        if (startIndex != -1) {
            System.out.println(name.substring(startIndex, name.length()));
            return name.substring(startIndex, name.length());
        } else {
            return null;
        }
    }

    public String getAuthorization() {
        System.out.println("in getAuthorization()");
        String userid = getCurrentRemoteUser();

        if (userid != null) {
            System.out.println("!!!!");
            List<JSONObject> results = getUserByUserId(userid);
            System.out.println("***** " + results.toString());
            JSONObject obj = results.get(0);
            String userRole = obj.getString("RolesName");

           if (userRole == "NA") {
               System.out.println("userRole: " + REG_USER);
               return REG_USER;
           } else {
               System.out.println("userRole: " + userRole);
               return userRole;
           }
        } else {
            // user doesn't have permission to access the app
            System.out.println("userRole: " + DENIED);
            return DENIED;
        }
    }

    /**
     * Get current remote user's location.
     *
     * @return
     */

    public String getUserLocation() {
        System.out.println("in getUserLocation()");
        String userLocation = "NA";
        String userid = getCurrentRemoteUser();

        if (userid != null) {
            System.out.println("!!!!");
            List<JSONObject> results = getUserByUserId(userid);
            System.out.println("***** " + results.toString());
            JSONObject obj = results.get(0);
            userLocation = obj.getString("LocationName");
        }
        return userLocation;
    }

    /**
     * Return  user's user, role, and location info by UserId.
     *
     * @param userId
     * @return
     */
    public List<JSONObject> getUserByUserId(String userId) {
        System.out.println("userid: " + userId);
        final String sql =
                "SELECT  users.*, coalesce(roles.Id, '-1') AS rolesId, " +
                "coalesce(roles.Name, 'NA') AS rolesName, " +
                "coalesce(locations.Id, '-1') AS locationsId, " +
                "coalesce(locations.Name, 'NA') AS locationsName, " +
                "coalesce(locations.Code, 'NA') AS locationsCode " +
                "FROM users " +
                "LEFT JOIN userroles ON userroles.UserId = users.Id " +
                "LEFT JOIN roles ON userroles.RoleId = roles.Id " +
                "LEFT JOIN userlocations ON userlocations.UserId = users.Id " +
                "LEFT JOIN locations ON userlocations.LocationId = locations.Id " +
                "WHERE users.UserId = ?";
        System.out.println("1");

        final List<JSONObject> usersList = jdbcTemplate.query(sql, new ResultSetExtractor<List<JSONObject>>() {

            @Override
            public List<JSONObject> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                System.out.println("2");
                List<JSONObject> list = new ArrayList<JSONObject>();

                while (resultSet.next()) {
                    JSONObject u = new JSONObject();
                    u.put("UID", resultSet.getInt("users.Id"));
                    u.put("UsersID", resultSet.getString("users.UserId"));
                    u.put("FirstName", resultSet.getString("users.FirstName"));
                    u.put("LastName", resultSet.getString("users.LastName"));
                    u.put("RID", resultSet.getInt("rolesId"));
                    u.put("RolesName", resultSet.getString("rolesName"));
                    u.put("LID", resultSet.getInt("locationsId"));
                    u.put("LocationsName", resultSet.getString("locationsName"));
                    u.put("LocationsCode", resultSet.getString("locationsCode"));

                    list.add(u);
                }

                System.out.println(list);
                return list;
            }
        }, userId);
        System.out.println("print: " + usersList.toString());
        return usersList;
    }




}
