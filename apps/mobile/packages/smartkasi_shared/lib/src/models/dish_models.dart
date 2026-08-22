part of '../models.dart';

class TopProduct {
  const TopProduct({
    required this.name,
    required this.qty,
    required this.totalCents,
  });

  factory TopProduct.fromJson(JsonMap json) => TopProduct(
    name: text(json['name']),
    qty: cents(json['qty']),
    totalCents: cents(json['total_cents']),
  );

  final String name;
  final int qty;
  final int totalCents;
}

class DishBasket {
  const DishBasket({
    required this.dish,
    required this.servings,
    required this.estimatedTotalCents,
    required this.ingredients,
  });

  factory DishBasket.fromJson(JsonMap json) => DishBasket(
    dish: text(json['dish']),
    servings: cents(json['servings']),
    estimatedTotalCents: cents(json['estimated_total_cents']),
    ingredients: asMapList(
      json['ingredients'],
    ).map(DishIngredient.fromJson).toList(),
  );

  final String dish;
  final int servings;
  final int estimatedTotalCents;
  final List<DishIngredient> ingredients;
}

class DishIngredient {
  const DishIngredient({
    required this.name,
    required this.quantity,
    this.bestOffer,
  });

  factory DishIngredient.fromJson(JsonMap json) => DishIngredient(
    name: text(json['name']),
    quantity: text(json['quantity']),
    bestOffer: json['best_offer'] == null
        ? null
        : ProductOffer.fromJson(asMap(json['best_offer'])),
  );

  final String name;
  final String quantity;
  final ProductOffer? bestOffer;
}
