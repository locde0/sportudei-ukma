package postgres

import (
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

func toPgEventStatus(s domain.EventStatus) gen.EventStatus {
	return gen.EventStatus(s)
}

func fromPgEventStatus(s gen.EventStatus) domain.EventStatus {
	return domain.EventStatus(s)
}

func mapSlice[F any, T any](slice []F, mapFn func(*F) T) []T {
	if slice == nil {
		return nil
	}

	result := make([]T, len(slice))
	for i := range slice {
		result[i] = mapFn(&slice[i])
	}

	return result
}
