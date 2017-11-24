package com.duke.test;

import com.duke.Dao.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.servlet.http.HttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;


public class UsersDaoTest {
    private UsersDao testUsersDao;
    private String expectedUserId = "goulets";

    @BeforeEach
    public void runBefore() {
        testUsersDao = new UsersDao();
    }

    @Test
    public void testGetCurrentRemoteUser() {
        String userid = testUsersDao.getCurrentRemoteUser();
        assertEquals(expectedUserId, userid);
    }

    @Test
    public void testIsRegularUser() {

    }

}
