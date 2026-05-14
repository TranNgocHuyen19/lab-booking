package iuh.labbooking.dto.response.base;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(
        T data,
        int page,
        int totalPages,
        int limit,
        long totalItems
) {
    public static <E, R> PageResponse<List<R>> fromPage(Page<E> page, Function<E, R> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber() + 1,
                page.getTotalPages(),
                page.getSize(),
                page.getTotalElements()
        );
    }

    public static <R> PageResponse<List<R>> empty() {
        return new PageResponse<>(
                List.of(),
                1,
                0,
                0,
                0
        );
    }
}
