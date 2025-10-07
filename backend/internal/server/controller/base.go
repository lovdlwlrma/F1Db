package controller

// BaseController provides common functionality for controllers
type BaseController struct{}

// NewBaseController creates a new BaseController instance
func NewBaseController() *BaseController {
	return &BaseController{}
}

// ErrorResponse represents a standard error response structure
type ErrorResponse struct {
	Status  int    `json:"status" example:"400"`
	Message string `json:"message" example:"Bad request"`
	Error   string `json:"error,omitempty" example:"Invalid input"`
}
