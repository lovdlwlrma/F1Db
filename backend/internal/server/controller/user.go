package controller

import (
	"net/http"
	"strconv"

	"lovdlwlrma/backend/deployments/database/postgres"
	"lovdlwlrma/backend/internal/log"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserController struct {
	pg *postgres.PostgresDB
}

func NewUserController(pg *postgres.PostgresDB) *UserController {
	return &UserController{
		pg: pg,
	}
}

// Create user godoc
// @Summary      Create a user
// @Description  Create a user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        user  body      postgres.User true "User"
// @Success      201      {object}  postgres.User
// @Failure      400      {object}  HTTPError
// @Failure      500      {object}  HTTPError
// @Router       /users [post]
func (u *UserController) Create(c *gin.Context) {
	var user postgres.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := u.pg.CreateUser(&user); err != nil {
		log.Error("Failed to create user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// Get user godoc
// @Summary      Get a user
// @Description  Get a user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Success      200  {object}  postgres.User
// @Failure      400  {object}  HTTPError
// @Failure      500  {object}  HTTPError
// @Router       /users/{id} [get]
func (u *UserController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	user, err := u.pg.GetUser(uint(id))
	if err != nil {
		log.Error("Failed to get user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// List users godoc
// @Summary      List users
// @Description  List users
// @Tags         users
// @Accept       json
// @Produce      json
// @Success      200  {array}   postgres.User
// @Failure      500  {object}  HTTPError
// @Router       /users [get]
func (u *UserController) List(c *gin.Context) {
	users, err := u.pg.ListUsers()
	if err != nil {
		log.Error("Failed to list users", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// Update user godoc
// @Summary      Update a user
// @Description  Update a user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Param        user body      postgres.User true "User"
// @Success      200  {object}  postgres.User
// @Failure      400  {object}  HTTPError
// @Failure      500  {object}  HTTPError
// @Router       /users/{id} [put]
func (u *UserController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var user postgres.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.ID = uint(id)
	if err := u.pg.UpdateUser(&user); err != nil {
		log.Error("Failed to update user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// Delete user godoc
// @Summary      Delete a user
// @Description  Delete a user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Success      204  {object}  nil
// @Failure      400  {object}  HTTPError
// @Failure      500  {object}  HTTPError
// @Router       /users/{id} [delete]
func (u *UserController) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := u.pg.DeleteUser(uint(id)); err != nil {
		log.Error("Failed to delete user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func RegisterUserRoutes(rg *gin.RouterGroup, pg *postgres.PostgresDB) {
	userCtrl := NewUserController(pg)

	users := rg.Group("/users")
	{
		users.POST("/", userCtrl.Create)
		users.GET("/", userCtrl.List)
		users.GET("/:id", userCtrl.Get)
		users.PUT("/:id", userCtrl.Update)
		users.DELETE("/:id", userCtrl.Delete)
	}
}
