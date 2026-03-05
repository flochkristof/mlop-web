import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

export function useZodForm<TSchema extends z.ZodType<any, any>>(
  props: Omit<UseFormProps<z.input<TSchema>>, "resolver"> & {
    schema: TSchema;
  },
): UseFormReturn<z.input<TSchema>, unknown, z.input<TSchema>> {
  return useForm<z.input<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema as any, undefined, {
      // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
      raw: true,
    }),
  });
}
