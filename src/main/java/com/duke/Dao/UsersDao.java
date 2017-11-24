package com.duke.Dao;

import com.duke.Entity.*;
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
     * I hardcoded a userid for testing.

     */
    public String getCurrentRemoteUser() {
        // TODO: Use HttpServlet to get remote user. Uncomment first line below for project handin.
        // String username = request.getRemoteUser();
        String name = "ae\\goulets";

        int startIndex = name.indexOf("\\") + 1;

        if (startIndex != -1) {
            return name.substring(startIndex, name.length());
        } else {
            return null;
        }
    }

    public List<Users> getAuthorization() {
        String userid = getCurrentRemoteUser();

        if (userid != null) {
            return getUserByUserId(userid);
        } else {
            return null;
        }
    }


    /**
     * Return  user's user, role, and location info by UserId.
     *
     * @param userId
     * @return
     */
    public List<Users> getUserByUserId(String userId) {
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

        final List<Users> usersList = jdbcTemplate.query(sql, new ResultSetExtractor<List<Users>>() {

            @Override
            public List<Users> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                List<Users> list = new ArrayList<Users>();

                while (resultSet.next()) {
                    Users u = new Users();
                    u.setId(resultSet.getInt("users.Id"));
                    u.setUserId(resultSet.getString("users.UserId"));
                    u.setFirstName(resultSet.getString("users.FirstName"));
                    u.setLastName(resultSet.getString("users.LastName"));
                    u.setRolesId(resultSet.getInt("rolesId"));
                    u.setRolesName(resultSet.getString("rolesName"));
                    u.setLocationId(resultSet.getInt("locationsId"));
                    u.setLocationName(resultSet.getString("locationsName"));
                    u.setLocationCode(resultSet.getString("locationsCode"));

                    list.add(u);
                }

                System.out.println(list);
                return list;
            }
        }, userId);
        return usersList;
    }




}
